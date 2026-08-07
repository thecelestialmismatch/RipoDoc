/**
 * `ripodoc overlay` — make an existing PDF clickable.
 *
 * This is the command behind the sales motion in `IDEA.md`: an MSP sends the
 * report they already send, and it comes back with every figure linked to its
 * approved rows. Nothing about their reporting stack changes.
 *
 * Two steps, on purpose:
 *
 *   1. propose — detect where each figure sits and write a placement file
 *      a person reviews.
 *   2. publish — turn approved placements into the clickable PDF.
 *
 * Step 1 is a heuristic. Step 2 is deterministic. Keeping them apart is what
 * stops a mis-detected zone from reaching a client.
 *
 *   node --experimental-strip-types tools/evidence-pdf/src/overlay-cli.ts \
 *     --pdf inbox/harbourview-q2.pdf \
 *     --manifest web/frontend/content/reports/rpt-demo-0001.json \
 *     --propose build/harbourview-q2.placements.json
 *
 *   node --experimental-strip-types tools/evidence-pdf/src/overlay-cli.ts \
 *     --pdf inbox/harbourview-q2.pdf \
 *     --manifest web/frontend/content/reports/rpt-demo-0001.json \
 *     --placements build/harbourview-q2.placements.json \
 *     --out build/harbourview-q2.clickable.pdf --origin https://ripodoc.com
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseManifest } from '../../../web/frontend/src/lib/evidence/manifest.ts';
import { mintEvidenceBaseUrl, expiryDate, staleExpiryWarning } from './link/base-url.ts';
import { PdfReader } from './overlay/reader.ts';
import {
  overlayEvidenceLinks,
  parsePlacementFile,
  proposePlacements,
  readEvidenceLinks,
  sha256,
  type ReviewedPlacement,
} from './overlay/plan.ts';

const USAGE = `Usage:
  --pdf <file.pdf> --manifest <report.json> --propose <placements.json>
  --pdf <file.pdf> --manifest <report.json> --placements <placements.json> --out <out.pdf>
     [--origin https://ripodoc.com | --base-url <pre-signed>] [--ttl-days 14]
     [--padding 2] [--allow-unreviewed] [--allow-partial] [--allow-loopback-http]`;

interface Flags {
  readonly values: ReadonlyMap<string, string>;
  readonly booleans: ReadonlySet<string>;
}

const parseArgs = (argv: readonly string[]): Flags => {
  const values = new Map<string, string>();
  const booleans = new Set<string>();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] ?? '';
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (next === undefined || next.startsWith('--')) {
      booleans.add(key);
      continue;
    }
    if (next === 'true' || next === 'false') {
      if (next === 'true') booleans.add(key);
      values.set(key, next);
      index += 1;
      continue;
    }
    values.set(key, next);
    index += 1;
  }
  return { values, booleans };
};

const required = (flags: Flags, key: string): string => {
  const value = flags.values.get(key);
  if (!value) throw new Error(`Missing --${key}\n${USAGE}`);
  return value;
};

const table = (rows: ReadonlyArray<readonly string[]>): string => {
  if (rows.length === 0) return '';
  const widths = (rows[0] ?? []).map((_, column) =>
    Math.max(...rows.map((row) => (row[column] ?? '').length)),
  );
  return rows
    .map((row) => row.map((cell, column) => cell.padEnd(widths[column] ?? 0)).join('  ').trimEnd())
    .join('\n');
};

const describe = (placement: ReviewedPlacement): readonly string[] => [
  placement.elementId,
  `p${placement.page}`,
  `${placement.rect.x.toFixed(0)},${placement.rect.y.toFixed(0)} ` +
    `${placement.rect.width.toFixed(0)}x${placement.rect.height.toFixed(0)}`,
  JSON.stringify(placement.matchedText ?? '').slice(0, 46),
  placement.note ?? '',
];

const main = (): void => {
  const flags = parseArgs(process.argv.slice(2));
  const pdfPath = resolve(required(flags, 'pdf'));
  const manifestPath = resolve(required(flags, 'manifest'));

  const pdfBytes = readFileSync(pdfPath);
  const manifestJson = readFileSync(manifestPath, 'utf8');
  const manifest = parseManifest(JSON.parse(manifestJson));
  const padding = Number.parseFloat(flags.values.get('padding') ?? '2');

  const proposeTo = flags.values.get('propose');
  if (proposeTo) {
    const reader = PdfReader.open(pdfBytes);
    const { file, report } = proposePlacements(reader, manifest, pdfBytes, { padding });
    const outPath = resolve(proposeTo);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify(file, null, 2)}\n`);


    return;
  }

  const outPath = resolve(required(flags, 'out'));
  const ttlDays = Number.parseInt(flags.values.get('ttl-days') ?? '14', 10);
  if (!Number.isInteger(ttlDays) || ttlDays < 1 || ttlDays > 365) {
    throw new Error('--ttl-days must be an integer between 1 and 365');
  }

  const allowUnreviewed = flags.booleans.has('allow-unreviewed');
  let placements: readonly ReviewedPlacement[];

  const placementsPath = flags.values.get('placements');
  if (placementsPath) {
    const file = parsePlacementFile(JSON.parse(readFileSync(resolve(placementsPath), 'utf8')));
    if (file.pdfSha256 !== sha256(pdfBytes)) {
      throw new Error(
        'The placement file was reviewed against a different PDF ' +
          `(expected ${file.pdfSha256}, this file is ${sha256(pdfBytes)}). ` +
          'Re-run --propose against this exact document: coordinates do not survive a re-export.',
      );
    }
    if (file.reportId !== manifest.reportId || file.version !== manifest.version) {
      throw new Error(
        `The placement file is for ${file.reportId} v${file.version}, ` +
          `not ${manifest.reportId} v${manifest.version}`,
      );
    }
    placements = file.placements;
  } else {
    if (!allowUnreviewed) {
      throw new Error(
        'No --placements file. Run with --propose first and review the zones, ' +
          'or pass --allow-unreviewed to publish auto-detected placements.',
      );
    }
    const reader = PdfReader.open(pdfBytes);
    const { file, report } = proposePlacements(reader, manifest, pdfBytes, { padding });
    if (report.ambiguous.length > 0) {
      throw new Error(
        `Ambiguous placements for: ${report.ambiguous
          .map((entry) => entry.elementId)
          .join(', ')}. Run --propose and choose.`,
      );
    }
    placements = file.placements;

  }

  const baseUrl = mintEvidenceBaseUrl({
    manifest,
    baseUrl: flags.values.get('base-url'),
    origin: flags.values.get('origin'),
    ttlDays,
  });

  const outcome = overlayEvidenceLinks({
    pdfBytes,
    manifest,
    placements,
    baseUrl,
    allowLoopbackHttp: flags.booleans.has('allow-loopback-http'),
    allowUnreviewed,
    allowPartial: flags.booleans.has('allow-partial'),
  });

  // Post-condition: re-read the finished file and confirm the links are there.
  const readBack = readEvidenceLinks(outcome.bytes);
  const expected = new Set(outcome.links.map((link) => link.uri));
  const actual = new Set(readBack.map((link) => link.uri));
  for (const uri of expected) {
    if (!actual.has(uri)) throw new Error(`Link for ${uri} is missing from the produced PDF`);
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, outcome.bytes);

  const expiresAt = expiryDate(manifest, ttlDays);
  const expires = expiresAt.toISOString().slice(0, 10);

};

main();
