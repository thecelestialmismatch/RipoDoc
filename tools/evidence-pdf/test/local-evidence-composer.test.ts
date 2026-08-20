import assert from 'node:assert/strict';
import test from 'node:test';
import { approvedSourcesFromReports, createDrafts, extractCandidateQuestions, reviewStatus } from '../../../web/frontend/src/lib/composer/local-evidence.ts';
import type { ReportManifest } from '../../../web/frontend/src/lib/evidence/types.ts';

const reports: readonly ReportManifest[] = [{
  reportId: 'rpt-local-composer-0001',
  version: 1,
  title: 'Northgate operational evidence register',
  provider: 'Northgate Managed IT',
  client: 'Harbourview Legal',
  periodLabel: 'Q3 2026',
  publishedAt: '2026-08-01T10:00:00Z',
  recipient: { name: 'Local reviewer', email: 'reviewer@example.test' },
  source: { system: 'PSA fixture', description: 'Reviewed operational record', capturedAt: '2026-08-01T09:00:00Z' },
  elements: [{
    id: 'incident-response-process',
    kind: 'claim',
    label: 'Approved incident response process',
    caption: 'The incident response process is documented, reviewed, and approved by the service operations lead.',
    evidence: {
      title: 'Incident response review record',
      summary: 'The approved service operations process requires incident triage, escalation, and documented closure review.',
      table: { columns: [{ key: 'status', label: 'Status' }], rows: [{ status: 'approved' }] },
      provenance: { sourceSystem: 'PSA fixture', sourceQuery: 'reviewed incident process record', approvedBy: 'Priya Raman', approvedAt: '2026-08-01T10:00:00Z' },
    },
  }],
}];

test('local evidence composer extracts questions and creates source-linked drafts only from approved workspace evidence', () => {
  const sources = approvedSourcesFromReports(reports);
  const questions = extractCandidateQuestions('1. Do you have an approved incident response process?\n2. What is your office coffee budget?');
  const drafts = createDrafts(questions, sources);

  assert.equal(sources.length, 1);
  assert.equal(drafts.length, 2);
  assert.equal(drafts[0]?.strength, 'strong');
  assert.equal(drafts[0]?.status, 'ready-for-review');
  assert.equal(drafts[0]?.citations[0]?.elementId, 'incident-response-process');
  assert.match(drafts[0]?.answer ?? '', /source-linked and still requires reviewer approval/);
  assert.equal(drafts[1]?.strength, 'missing');
  assert.equal(drafts[1]?.status, 'needs-evidence');
  assert.match(drafts[1]?.answer ?? '', /No approved evidence record/);
});

test('local evidence composer refuses approval when a draft lacks strong approved evidence', () => {
  const [strong, missing] = createDrafts([
    'Do you have an approved incident response process?',
    'What is your office coffee budget?',
  ], approvedSourcesFromReports(reports));

  const approved = reviewStatus(strong!, 'approved', 'Reviewed against the approved operational record.');
  const blocked = reviewStatus(missing!, 'approved');

  assert.equal(approved.status, 'approved');
  assert.equal(approved.reviewerNote, 'Reviewed against the approved operational record.');
  assert.equal(blocked.status, 'needs-evidence');
  assert.match(blocked.reviewerNote, /Approval blocked/);
});
