import { notFound } from 'next/navigation';
import { LocalEvidenceComposer } from '@/components/dashboard/LocalEvidenceComposer.tsx';
import type { ReportManifest } from '@/lib/evidence/types.ts';

export const dynamic = 'force-dynamic';

const fixtureReports: readonly ReportManifest[] = [{
  reportId: 'e2e-composer-fixture',
  version: 1,
  title: 'E2E approved evidence fixture',
  provider: 'RipoDoc automated test',
  client: 'E2E fixture workspace',
  periodLabel: 'Test period',
  publishedAt: '2026-08-20T00:00:00Z',
  recipient: { name: 'Test reviewer', email: 'reviewer@example.test' },
  source: { system: 'RipoDoc test fixture', description: 'Non-customer deterministic test record', capturedAt: '2026-08-20T00:00:00Z' },
  elements: [{
    id: 'incident-response',
    kind: 'claim',
    label: 'Approved incident response process',
    caption: 'The approved incident response process requires triage, escalation, and closure review.',
    evidence: {
      title: 'Incident response fixture',
      summary: 'The approved service operations process requires incident triage, escalation, and documented closure review.',
      table: { columns: [{ key: 'status', label: 'Status' }], rows: [{ status: 'fixture approved' }] },
      provenance: { sourceSystem: 'RipoDoc test fixture', sourceQuery: 'automated local-only test', approvedBy: 'Test reviewer', approvedAt: '2026-08-20T00:00:00Z' },
    },
  }],
}];

export default function ComposerE2ePage() {
  if (process.env.RIPODOC_E2E_TEST_MODE !== 'true') notFound();
  return <main className="dense-route min-h-screen px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><p className="mb-4 border border-[var(--line)] bg-[#101a29] p-3 text-xs text-[#bdcce0]">Automated browser-test harness. Fixture data only. Disabled outside explicit local test mode.</p><LocalEvidenceComposer reports={fixtureReports} /></div></main>;
}
