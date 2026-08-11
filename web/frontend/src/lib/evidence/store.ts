/**
 * Server-side manifest store.
 *
 * Published report versions are immutable, so read paths never mutate a
 * manifest. A future database implementation can preserve this module's API
 * while replacing file-system persistence with PostgreSQL or an object store.
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { parseManifest } from './manifest.ts';
import type { ReportManifest } from './types.ts';

const CONTENT_ROOT = process.env.RIPODOC_CONTENT_ROOT ?? path.join(/* turbopackIgnore: true */ process.cwd(), 'content', 'reports');

/** Report ids come from signed tokens, but path traversal is cheap to rule out. */
const SAFE_REPORT_ID = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;

const safeReportPath = (reportId: string): string | undefined => {
  if (!SAFE_REPORT_ID.test(reportId)) return undefined;
  const reportPath = path.join(CONTENT_ROOT, `${reportId}.json`);
  return path.normalize(reportPath).startsWith(CONTENT_ROOT) ? reportPath : undefined;
};

export const loadManifest = async (
  reportId: string,
): Promise<ReportManifest | undefined> => {
  const path = safeReportPath(reportId);
  if (!path) return undefined;

  let raw: string;
  try {
    raw = await readFile(/* turbopackIgnore: true */ path, 'utf8');
  } catch {
    return undefined;
  }

  try {
    const manifest = parseManifest(JSON.parse(raw));
    return manifest.reportId === reportId ? manifest : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Load all validated published manifests available to the current workspace.
 *
 * Invalid or unreadable files are deliberately excluded: a dashboard must not
 * advertise a report that cannot pass the same schema boundary as evidence
 * delivery. Results are newest-first and deterministic for equal timestamps.
 */
export const listPublishedManifests = async (): Promise<readonly ReportManifest[]> => {
  let files: readonly string[];
  try {
    files = await readdir(CONTENT_ROOT);
  } catch {
    return [];
  }

  const manifests = await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map(async (file) => loadManifest(file.slice(0, -'.json'.length))),
  );

  return manifests
    .filter((manifest): manifest is ReportManifest => manifest !== undefined)
    .sort((left, right) => {
      const publishedDelta = Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
      return publishedDelta !== 0 ? publishedDelta : left.reportId.localeCompare(right.reportId);
    });
};

/**
 * Validate and persist a manifest to `content/reports/`.
 *
 * This is a file-system write and is intentionally not exposed on the
 * evidence-page path. It is used by the local publishing workflow; production
 * persistence is provided by the hosted API implementation.
 */
export const saveManifest = async (manifest: ReportManifest): Promise<void> => {
  const validated = parseManifest(manifest);
  if (validated.reportId !== manifest.reportId) {
    throw new Error('Manifest reportId mismatch after re-validation');
  }

  const path = safeReportPath(manifest.reportId);
  if (!path) throw new Error(`Invalid report id: ${manifest.reportId}`);

  await mkdir(CONTENT_ROOT, { recursive: true });
  await writeFile(path, JSON.stringify(validated, null, 2), 'utf8');
};
