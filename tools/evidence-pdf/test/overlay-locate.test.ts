import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PdfReader } from '../src/overlay/reader.ts';
import { extractTextLines, rectForSubstring } from '../src/overlay/text.ts';
import {
  clampToPage,
  padUserRect,
  userRectToVisual,
  visualRectToUser,
  visualSize,
  type UserRect,
} from '../src/overlay/geometry.ts';
import { locatePlacements, locatorFor } from '../src/overlay/locate.ts';
import type { ReportManifest } from '../../../web/frontend/src/lib/evidence/types.ts';
import { classicPdf, croppedPdf, rotatedPdf } from './helpers/pdf-fixtures.ts';

const lineTexts = (bytes: Buffer): readonly string[] => {
  const reader = PdfReader.open(bytes);
  const page = reader.pages[0];
  assert.ok(page);
  return extractTextLines(reader, page).map((line) => line.text);
};

test('text comes back with its lines intact', () => {
  assert.deepEqual(lineTexts(classicPdf()), ['412 97.4% 14', 'Tickets resolved', 'May 148']);
});

test('kerning inside a number does not split it in two', () => {
  // The fixture writes `May 148` as [(May 1) -20 (48)] TJ.
  assert.ok(lineTexts(classicPdf()).includes('May 148'));
});

test('a substring resolves to the rectangle its glyphs occupy', () => {
  const reader = PdfReader.open(classicPdf());
  const page = reader.pages[0];
  assert.ok(page);
  const line = extractTextLines(reader, page).find((candidate) =>
    candidate.text.startsWith('412'),
  );
  assert.ok(line);

  const first = rectForSubstring(line, 0, 3);
  const last = rectForSubstring(line, line.text.length - 2, line.text.length);
  assert.ok(first && last);
  assert.ok(last[0] > first[2], 'the trailing figure sits to the right of the leading one');
  assert.ok(first[3] - first[1] > 10, 'a 24pt glyph box is at least 10pt tall');
  assert.ok(first[0] >= 19 && first[0] <= 21, `expected the run to start at x≈20, got ${first[0]}`);
});

test('visual and user coordinates round-trip at every rotation', () => {
  for (const rotate of [0, 90, 180, 270]) {
    const reader = PdfReader.open(rotatedPdf(rotate));
    const page = reader.pages[0];
    assert.ok(page);
    const zone = { x: 12, y: 8, width: 30, height: 16 };
    const user = visualRectToUser(page, zone);
    const back = userRectToVisual(page, user);
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      assert.ok(
        Math.abs(back[key] - zone[key]) < 1e-6,
        `rotate ${rotate}: ${key} ${back[key]} != ${zone[key]}`,
      );
    }
  }
});

test('rotation swaps the page dimensions a human measures against', () => {
  const upright = PdfReader.open(rotatedPdf(0)).pages[0];
  const turned = PdfReader.open(rotatedPdf(90)).pages[0];
  assert.ok(upright && turned);
  assert.deepEqual(visualSize(upright), { width: 200, height: 100 });
  assert.deepEqual(visualSize(turned), { width: 100, height: 200 });
});

test('a zone is measured from the visible area, not the media box', () => {
  const reader = PdfReader.open(croppedPdf());
  const page = reader.pages[0];
  assert.ok(page);
  const user = visualRectToUser(page, { x: 0, y: 0, width: 10, height: 10 });
  assert.deepEqual(user, [20, 80, 30, 90], 'the top-left of a cropped page is its crop box corner');
});

test('a zone is clamped inside the page rather than silently dropped by a viewer', () => {
  const reader = PdfReader.open(classicPdf());
  const page = reader.pages[0];
  assert.ok(page);
  const grown = clampToPage(page, padUserRect([0, 0, 200, 100] as UserRect, 20));
  assert.deepEqual(grown, [0, 0, 200, 100]);
});

const manifestWith = (
  elements: ReportManifest['elements'],
): ReportManifest => ({
  reportId: 'rpt-test-0001',
  version: 1,
  title: 'Test',
  provider: 'Northgate Managed IT',
  client: 'Harbourview Legal',
  periodLabel: 'Q2 2026',
  publishedAt: '2026-07-02T09:15:00Z',
  recipient: { name: 'Dana', email: 'dana@example.test' },
  elements,
});

const evidence = {
  title: 'Detail',
  summary: 'Rows',
  table: { columns: [{ key: 'a', label: 'A' }], rows: [{ a: '1' }] },
  provenance: {
    sourceSystem: 'RMM',
    sourceQuery: 'select 1',
    approvedBy: 'Priya Raman',
    approvedAt: '2026-07-02T09:10:00Z',
  },
};

test('a figure is matched to its headline, not to the same digits inside another number', () => {
  const reader = PdfReader.open(classicPdf());
  const manifest = manifestWith([
    { id: 'assets-at-risk', kind: 'kpi', label: 'Tickets resolved', value: '14', evidence },
  ]);

  const report = locatePlacements(reader, manifest);
  assert.equal(report.ambiguous.length, 0);
  assert.equal(report.unmatched.length, 0);

  const placement = report.matched[0];
  assert.ok(placement);
  assert.equal(placement.matchedText, '14');
  assert.ok(
    placement.rect[1] > 50,
    'the 24pt headline sits high on the page; the 8pt "148" sits low',
  );
  assert.ok(placement.reasons.some((reason) => reason.includes('stands alone')));
});

test('a figure that appears nowhere is reported, never guessed', () => {
  const reader = PdfReader.open(classicPdf());
  const manifest = manifestWith([
    { id: 'missing', kind: 'kpi', label: 'Nowhere at all', value: '99999', evidence },
  ]);
  const report = locatePlacements(reader, manifest);
  assert.deepEqual(report.unmatched, ['missing']);
  assert.equal(report.matched.length, 0);
});

test('two equally good candidates are escalated to a human', () => {
  const reader = PdfReader.open(classicPdf());
  // `4` occurs in 412, 97.4%, 14 and 148 with nothing to tell them apart.
  const manifest = manifestWith([
    { id: 'ambiguous', kind: 'claim', label: '4', evidence },
  ]);
  const report = locatePlacements(reader, manifest);
  assert.equal(report.matched.length, 0);
  assert.equal(report.ambiguous.length, 1);
  assert.ok((report.ambiguous[0]?.candidates.length ?? 0) > 1);
});

test('the locator prefers the figure, then the label', () => {
  assert.deepEqual(
    locatorFor({
      id: 'x',
      kind: 'kpi',
      label: 'Assets at risk',
      value: '14',
      caption: 'Out of warranty',
      evidence,
    }),
    ['14', 'Assets at risk', 'Out of warranty'],
  );
  assert.deepEqual(
    locatorFor({ id: 'y', kind: 'claim', label: 'Backups verified', caption: '91 jobs', evidence }),
    ['Backups verified', '91 jobs'],
  );
});
