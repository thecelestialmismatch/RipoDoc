/**
 * Server-side manifest store.
 *
 * Published report versions are immutable, so this is a read-only lookup by
 * design — there is deliberately no update path. A future database
 * implementation swaps the body of `loadManifest` and nothing else changes.
 */

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
