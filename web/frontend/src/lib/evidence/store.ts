/**
 * Server-side manifest store.
 *
 * Published report versions are immutable, so this is a read-only lookup by
 * design — there is deliberately no update path. A future database
 * implementation swaps the body of `loadManifest` and nothing else changes.
 *
 * `saveManifest` writes a *validated* manifest to `content/reports/`. It is
 * used by the local publishing flow (not by evidence pages at runtime, which
 * only ever read). In production the Go API handles persistence to PostgreSQL.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { parseManifest } from './manifest.ts';
import type { ReportManifest } from './types.ts';

const CONTENT_ROOT = join(process.cwd(), 'content', 'reports');

/** Report ids come from signed tokens, but path traversal is cheap to rule out. */
const SAFE_REPORT_ID = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;

export const loadManifest = async (
  reportId: string,
): Promise<ReportManifest | undefined> => {
  if (!SAFE_REPORT_ID.test(reportId)) return undefined;

  const path = join(CONTENT_ROOT, `${reportId}.json`);
  if (!normalize(path).startsWith(CONTENT_ROOT)) return undefined;

  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    return undefined;
  }

  const manifest = parseManifest(JSON.parse(raw));
  return manifest.reportId === reportId ? manifest : undefined;
};

/**
 * Validate and persist a manifest to `content/reports/`.
 * The manifest is parsed through `parseManifest` first — only a manifest that
 * passes full validation is written. Throws on validation failure.
 *
 * This is a file-system write and is intentionally not exposed on the
 * evidence-page path. It is called by the local publish API route and by the
 * offline fixture generator.
 */
export const saveManifest = async (manifest: ReportManifest): Promise<void> => {
  // Re-validate through the parser — this catches any field-level issues
  // that manual construction might have introduced.
  const validated = parseManifest(manifest);
  if (validated.reportId !== manifest.reportId) {
    throw new Error('Manifest reportId mismatch after re-validation');
  }

  if (!SAFE_REPORT_ID.test(manifest.reportId)) {
    throw new Error(`Invalid report id: ${manifest.reportId}`);
  }

  await mkdir(CONTENT_ROOT, { recursive: true });
  const path = join(CONTENT_ROOT, `${manifest.reportId}.json`);
  if (!normalize(path).startsWith(CONTENT_ROOT)) {
    throw new Error('Path traversal detected');
  }

  const json = JSON.stringify(manifest, null, 2);
  await writeFile(path, json, 'utf8');
};
