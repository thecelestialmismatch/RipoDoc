import assert from 'node:assert/strict';
import test from 'node:test';
import { assessProofOperations } from '../../../web/frontend/src/lib/evidence/operations.ts';
import { parseManifest } from '../../../web/frontend/src/lib/evidence/manifest.ts';

const report = (overrides: Record<string, unknown> = {}) => parseManifest({
  reportId: 'rpt-operations-0001',
  version: 2,
  title: 'Quarterly client report',
  provider: 'Northgate Managed IT',
  client: 'Harbourview Legal',
  periodLabel: 'Q2 2026',
  publishedAt: '2026-07-02T09:15:00Z',
  recipient: { name: 'Dana Whitfield', email: 'dana@example.com' },
  source: {
    system: 'PSA — approved service-management system',
    description: 'Closed tickets export for Q2 2026',
    method: 'manual export',
    capturedAt: '2026-07-01T16:40:00Z',
  },
  elements: [{
    id: 'tickets-resolved',
    kind: 'kpi',
    label: 'Tickets resolved',
    value: '412',
    evidence: {
      title: 'Tickets resolved',
      summary: 'Approved rows supporting the published figure.',
      table: { columns: [{ key: 'id', label: 'Ticket ID' }], rows: [{ id: 'T-1' }] },
      provenance: {
        sourceSystem: 'PSA — approved service-management system',
        sourceQuery: 'status = closed',
        approvedBy: 'Priya Raman',
        approvedAt: '2026-07-01T16:40:00Z',
      },
    },
  }],
  ...overrides,
});

test('a complete manifest is ready for a controlled evidence handoff', () => {
  const snapshot = assessProofOperations(report());
  assert.equal(snapshot.state, 'ready');
  assert.equal(snapshot.evidenceCoveragePercent, 100);
  assert.equal(snapshot.reviewedFigures, 1);
  assert.equal(snapshot.reviewedWithCompleteProvenance, 1);
  assert.match(snapshot.recipientLabel, /Dana Whitfield/);
  assert.doesNotMatch(snapshot.recipientLabel, /dana@example.com/);
  assert.ok(snapshot.coverage.every((item) => item.state === 'ready'));
});

test('a report without a declared source capture is flagged for attention without changing evidence coverage', () => {
  const snapshot = assessProofOperations(report({ source: undefined }));
  assert.equal(snapshot.state, 'attention');
  assert.equal(snapshot.evidenceCoveragePercent, 100);
  assert.equal(snapshot.coverage.find((item) => item.label === 'Source capture')?.state, 'attention');
});

test('a report with no approved figures is never marked ready', () => {
  // Publishing rejects empty manifests; this defensive branch protects any future
  // caller that constructs an operations snapshot before the publish boundary.
  const snapshot = assessProofOperations({ ...report(), elements: [] });
  assert.equal(snapshot.state, 'attention');
  assert.equal(snapshot.evidenceCoveragePercent, 0);
  assert.equal(snapshot.coverage.find((item) => item.label === 'Approved evidence')?.state, 'attention');
});
