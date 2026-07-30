/**
 * The end-to-end guard, run against a PDF RipoDoc did not write.
 *
 * `fixtures/sample-customer-report.pdf` was produced by LibreOffice: embedded
 * subset TrueType fonts, a real content stream, a real table. Every other test
 * in this suite uses a fixture built by hand, which proves the parser agrees
 * with the spec. This one proves it agrees with a shipping word processor —
 * the thing an MSP actually emails their client.
 *
 * It also pins the detection heuristics. `14` appears three times on that page:
 * once as the headline figure and twice inside `148` and `143`. If a change to
 * scoring ever makes RipoDoc pick a chart label instead, this fails.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseManifest } from '../../../web/frontend/src/lib/evidence/manifest.ts';
import { PdfReader } from '../src/overlay/reader.ts';
import {
  overlayEvidenceLinks,
  parsePlacementFile,
  proposePlacements,
  readEvidenceLinks,
  sha256,
} from '../src/overlay/plan.ts';

const fixture = (name: string): string => join(import.meta.dirname, '..', 'fixtures', name);

const pdfBytes = readFileSync(fixture('sample-customer-report.pdf'));
const manifest = parseManifest(
  JSON.parse(readFileSync(fixture('demo-report.json'), 'utf8')) as unknown,
);
const reviewed = parsePlacementFile(
  JSON.parse(readFileSync(fixture('sample-customer-report.placements.json'), 'utf8')) as unknown,
);

test('a word processor’s PDF is read without a rebuild', () => {
  const reader = PdfReader.open(pdfBytes);
  assert.equal(reader.pages.length, 1);
  assert.equal(reader.recovered, false, 'a well-formed file must not need the recovery scan');
});

test('every figure in the sample report is located, unambiguously', () => {
  const reader = PdfReader.open(pdfBytes);
  const { report } = proposePlacements(reader, manifest, pdfBytes);

  assert.deepEqual(report.unmatched, []);
  assert.deepEqual(
    report.ambiguous.map((entry) => entry.elementId),
    [],
  );
  assert.equal(report.matched.length, manifest.elements.length);

  const byElement = new Map(report.matched.map((entry) => [entry.elementId, entry]));
  assert.equal(byElement.get('tickets-resolved')?.matchedText, '412');
  assert.equal(byElement.get('sla-attainment')?.matchedText, '97.4%');
  assert.equal(byElement.get('assets-at-risk')?.matchedText, '14');
});

test('the headline 14 wins over the 14 inside 148 and 143', () => {
  const reader = PdfReader.open(pdfBytes);
  const { report } = proposePlacements(reader, manifest, pdfBytes);
  const assets = report.matched.find((entry) => entry.elementId === 'assets-at-risk');
  assert.ok(assets);

  const headlineHeight = assets.rect[3] - assets.rect[1];
  assert.ok(
    headlineHeight > 25,
    `expected the 30pt headline (got a ${headlineHeight.toFixed(1)}pt tall zone, ` +
      'which would be body text)',
  );
  assert.ok(assets.reasons.some((reason) => reason.includes('stands alone')));
});

test('the reviewed placements still match the shipped PDF byte for byte', () => {
  assert.equal(
    reviewed.pdfSha256,
    sha256(pdfBytes),
    'approved coordinates are bound to one exact document',
  );
  assert.equal(reviewed.reportId, manifest.reportId);
  assert.equal(reviewed.version, manifest.version);
  for (const placement of reviewed.placements) {
    assert.ok(placement.approvedBy, `${placement.elementId} must carry an approver`);
  }
});

test('publishing produces a file that still contains the customer’s original', () => {
  const outcome = overlayEvidenceLinks({
    pdfBytes,
    manifest,
    placements: reviewed.placements,
    baseUrl: 'https://ripodoc.com/e/token',
  });

  assert.equal(outcome.addedAnnotations, manifest.elements.length);
  assert.equal(outcome.updatedPageObjects.length, 1);
  assert.equal(outcome.originalLength, pdfBytes.length);
  assert.equal(Buffer.compare(outcome.bytes.subarray(0, pdfBytes.length), pdfBytes), 0);

  const links = readEvidenceLinks(outcome.bytes);
  assert.deepEqual(
    links.map((link) => link.uri).sort(),
    manifest.elements.map((element) => `https://ripodoc.com/e/token/${element.id}`).sort(),
  );
  for (const link of links) {
    assert.equal(link.page, 1);
    assert.ok(link.rect[2] > link.rect[0] && link.rect[3] > link.rect[1]);
  }
});

test('the overlaid sample carries no executable PDF constructs', () => {
  const outcome = overlayEvidenceLinks({
    pdfBytes,
    manifest,
    placements: reviewed.placements,
    baseUrl: 'https://ripodoc.com/e/token',
  });
  const appended = outcome.bytes.subarray(pdfBytes.length).toString('latin1');
  for (const forbidden of ['/JavaScript', '/OpenAction', '/Launch', 'javascript:']) {
    assert.ok(!appended.includes(forbidden));
  }
});
