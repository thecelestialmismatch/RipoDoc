import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  overlayEvidenceLinks,
  parsePlacementFile,
  proposePlacements,
  readEvidenceLinks,
  sha256,
  type ReviewedPlacement,
} from '../src/overlay/plan.ts';
import { PdfReader } from '../src/overlay/reader.ts';
import type { ReportManifest } from '../../../web/frontend/src/lib/evidence/types.ts';
import { classicPdf } from './helpers/pdf-fixtures.ts';

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

const manifest: ReportManifest = {
  reportId: 'rpt-test-0001',
  version: 3,
  title: 'Quarterly Business Review',
  provider: 'Northgate Managed IT',
  client: 'Harbourview Legal',
  periodLabel: 'Q2 2026',
  publishedAt: '2026-07-02T09:15:00Z',
  recipient: { name: 'Dana', email: 'dana@example.test' },
  elements: [
    { id: 'tickets-resolved', kind: 'kpi', label: 'Tickets resolved', value: '412', evidence },
  ],
};

const approved: ReviewedPlacement = {
  elementId: 'tickets-resolved',
  page: 1,
  rect: { x: 20, y: 20, width: 40, height: 20 },
  approvedBy: 'Priya Raman',
  approvedAt: '2026-07-02T09:10:00Z',
};

const base = {
  pdfBytes: classicPdf(),
  manifest,
  baseUrl: 'https://ripodoc.com/e/token',
};

test('approved placements become links the finished file reports back', () => {
  const outcome = overlayEvidenceLinks({ ...base, placements: [approved] });
  const links = readEvidenceLinks(outcome.bytes);
  assert.equal(links.length, 1);
  assert.equal(links[0]?.uri, 'https://ripodoc.com/e/token/tickets-resolved');
  assert.deepEqual(outcome.coveredElements, ['tickets-resolved']);
  assert.deepEqual(outcome.uncoveredElements, []);
});

test('a zone nobody approved does not reach a client', () => {
  const { approvedBy: _ignored, ...unapproved } = approved;
  assert.throws(
    () => overlayEvidenceLinks({ ...base, placements: [unapproved] }),
    /no approvedBy/,
  );
  assert.equal(
    overlayEvidenceLinks({ ...base, placements: [unapproved], allowUnreviewed: true })
      .addedAnnotations,
    1,
    'the gate is explicit, so a teardown can still be produced deliberately',
  );
});

test('a placement for an element the report does not have is refused', () => {
  assert.throws(
    () =>
      overlayEvidenceLinks({
        ...base,
        placements: [{ ...approved, elementId: 'not-in-this-report' }],
      }),
    /not an element of report rpt-test-0001 v3/,
  );
});

test('a report with an unlinked figure is refused unless that is deliberate', () => {
  const twoElements: ReportManifest = {
    ...manifest,
    elements: [
      ...manifest.elements,
      { id: 'sla-attainment', kind: 'kpi', label: 'SLA attainment', value: '97.4%', evidence },
    ],
  };
  assert.throws(
    () => overlayEvidenceLinks({ ...base, manifest: twoElements, placements: [approved] }),
    /No placement for: sla-attainment/,
  );
  const partial = overlayEvidenceLinks({
    ...base,
    manifest: twoElements,
    placements: [approved],
    allowPartial: true,
  });
  assert.deepEqual(partial.uncoveredElements, ['sla-attainment']);
});

test('a placement beyond the last page is refused', () => {
  assert.throws(
    () => overlayEvidenceLinks({ ...base, placements: [{ ...approved, page: 9 }] }),
    /targets page 9, but the PDF has 1 page/,
  );
});

test('a proposal is bound to the exact bytes it was reviewed against', () => {
  const pdf = classicPdf();
  const reader = PdfReader.open(pdf);
  const { file } = proposePlacements(reader, manifest, pdf);
  assert.equal(file.pdfSha256, sha256(pdf));
  assert.equal(file.reportId, 'rpt-test-0001');
  assert.equal(file.version, 3);
  assert.equal(file.placements.length, 1);
  assert.equal(file.placements[0]?.matchedText, '412');
  assert.equal(
    file.placements[0]?.approvedBy,
    undefined,
    'a proposal carries no approval; a person adds one',
  );
});

test('a proposal survives being written and read back', () => {
  const pdf = classicPdf();
  const { file } = proposePlacements(PdfReader.open(pdf), manifest, pdf);
  const reparsed = parsePlacementFile(JSON.parse(JSON.stringify(file)));
  assert.deepEqual(reparsed.placements[0]?.rect, file.placements[0]?.rect);
});

const validFile = {
  reportId: 'rpt-test-0001',
  version: 3,
  pdfSha256: 'a'.repeat(64),
  generatedAt: '2026-07-02T09:15:00Z',
  placements: [{ elementId: 'tickets-resolved', page: 1, rect: { x: 1, y: 2, width: 3, height: 4 } }],
};

test('placement files fail closed on anything unexpected', () => {
  assert.doesNotThrow(() => parsePlacementFile(validFile));

  const cases: ReadonlyArray<[string, unknown, RegExp]> = [
    ['not an object', 'nope', /must be an object/],
    ['no reportId', { ...validFile, reportId: '' }, /reportId is required/],
    ['version zero', { ...validFile, version: 0 }, /positive integer/],
    ['short hash', { ...validFile, pdfSha256: 'abc' }, /64 lowercase hex/],
    ['uppercase hash', { ...validFile, pdfSha256: 'A'.repeat(64) }, /64 lowercase hex/],
    ['no placements', { ...validFile, placements: [] }, /at least one placement/],
    [
      'page zero',
      { ...validFile, placements: [{ ...validFile.placements[0], page: 0 }] },
      /1-based/,
    ],
    [
      'empty rect',
      {
        ...validFile,
        placements: [{ ...validFile.placements[0], rect: { x: 1, y: 1, width: 0, height: 4 } }],
      },
      /positive area/,
    ],
    [
      'rect with a NaN',
      {
        ...validFile,
        placements: [
          { ...validFile.placements[0], rect: { x: 1, y: 1, width: Number.NaN, height: 4 } },
        ],
      },
      /finite/,
    ],
  ];

  for (const [label, input, pattern] of cases) {
    assert.throws(() => parsePlacementFile(input), pattern, `${label} must be rejected`);
  }
});
