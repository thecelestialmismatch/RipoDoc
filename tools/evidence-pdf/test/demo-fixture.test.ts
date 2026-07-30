/**
 * Integrity of the shipped demo manifest.
 *
 * These are not tests of the engine — they are tests of the artifact every
 * prospect sees. RipoDoc's whole claim is "click the figure and the rows behind
 * it open". A demo whose headline reads 14 and whose table holds 8 disproves
 * that claim more effectively than any competitor could.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseManifest } from '../../../web/frontend/src/lib/evidence/manifest.ts';

const ROOT = join(import.meta.dirname, '..', '..', '..');

/** The generator reads one copy; the web app serves the other. They must agree. */
const COPIES = [
  join(ROOT, 'tools', 'evidence-pdf', 'fixtures', 'demo-report.json'),
  join(ROOT, 'web', 'frontend', 'content', 'reports', 'rpt-demo-0001.json'),
];

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as unknown;

test('both copies of the demo manifest are the same document', () => {
  const [generatorCopy, servedCopy] = COPIES.map(read);
  assert.deepEqual(
    generatorCopy,
    servedCopy,
    'The PDF would cite figures the evidence pages do not serve. Update both copies.',
  );
});

test('each copy is a valid manifest', () => {
  for (const path of COPIES) assert.doesNotThrow(() => parseManifest(read(path)), path);
});

test('a KPI that counts things lists exactly that many rows', () => {
  const manifest = parseManifest(read(COPIES[0]!));

  for (const element of manifest.elements) {
    const rows = element.evidence?.table?.rows;
    // Only whole-number KPIs enumerate: "97.4%" is a rate whose evidence table
    // lists the breaches behind it, and those counts legitimately differ.
    if (!rows || element.kind !== 'kpi' || !/^\d+$/.test(element.value ?? '')) continue;

    assert.equal(
      rows.length,
      Number(element.value),
      `${element.id} claims ${element.value} but shows ${rows.length} rows — ` +
        'the exact discrepancy the product exists to eliminate',
    );
  }
});
