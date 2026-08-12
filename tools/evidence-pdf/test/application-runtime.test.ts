import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { after, test } from 'node:test';
import type { ReportManifest } from '../../../web/frontend/src/lib/evidence/types.ts';

const tempRoot = await mkdtemp(join(tmpdir(), 'ripodoc-runtime-test-'));
const reportsRoot = join(tempRoot, 'reports');
process.env.RIPODOC_CONTENT_ROOT = reportsRoot;

const { listPublishedManifests, saveManifest } = await import('../../../web/frontend/src/lib/evidence/store.ts');
const { getSecurityPosture } = await import('../../../web/frontend/src/lib/evidence/security-status.ts');

after(async () => rm(tempRoot, { recursive: true, force: true }));

const createManifest = (reportId: string, publishedAt: string): ReportManifest => ({
  reportId,
  version: 1,
  title: `Service review ${reportId}`,
  provider: 'Northgate Managed IT',
  client: 'Harbourview Legal',
  periodLabel: 'Q2 2026',
  publishedAt,
  recipient: { name: 'Dana Whitfield', email: 'dana@harbourviewlegal.example' },
  elements: [
    {
      id: 'tickets-resolved',
      kind: 'kpi',
      label: 'Tickets resolved',
      value: '412',
      evidence: {
        title: 'Tickets resolved',
        summary: 'The approved rows for the published figure.',
        table: { columns: [{ key: 'id', label: 'Ticket' }], rows: [{ id: 'NG-1001' }] },
        provenance: {
          sourceSystem: 'PSA',
          sourceQuery: 'status = closed',
          approvedBy: 'Priya Raman',
          approvedAt: '2026-07-01T10:00:00Z',
        },
      },
    },
  ],
});

test('published-manifest registry returns validated reports newest-first and excludes invalid files', async () => {
  await saveManifest(createManifest('rpt-older-0001', '2026-06-01T10:00:00Z'));
  await saveManifest(createManifest('rpt-newer-0001', '2026-07-01T10:00:00Z'));
  await writeFile(join(reportsRoot, 'rpt-invalid.json'), '{not-json', 'utf8');

  const manifests = await listPublishedManifests();
  assert.deepEqual(manifests.map((manifest) => manifest.reportId), ['rpt-newer-0001', 'rpt-older-0001']);
  assert.equal(manifests.every((manifest) => manifest.elements.length > 0), true);

});

test('security posture exposes safe configuration indicators rather than sensitive values', async () => {
  process.env.RIPODOC_EVIDENCE_SECRET = 'x'.repeat(32);
  process.env.RIPODOC_REVOKED_JTIS = 'revoked-1, revoked-2, , revoked-3';
  process.env.RIPODOC_ALLOW_EXPORT = 'false';
  delete process.env.RIPODOC_AUDIT_LOG;

  const posture = await getSecurityPosture();
  assert.equal(posture.evidenceSecretConfigured, true);
  assert.equal(posture.revokedTokenCount, 3);
  assert.equal(posture.exportsEnabled, false);
  assert.equal(posture.publishedReportCount, 2);
  assert.deepEqual(posture.auditLog, {
    mode: 'stdout',
    configured: false,
    message: 'Access events are emitted as structured stdout logs. Set RIPODOC_AUDIT_LOG on a persistent runtime to enable a locally verifiable append-only chain.',
  });
  assert.equal('secret' in posture, false);
  assert.equal(JSON.stringify(posture).includes('revoked-1'), false);
});

test('downloadable self-hosted route documents server-only worker configuration and the reviewed source bundle', async () => {
  const source = await readFile(new URL('../../../web/frontend/src/app/download/page.tsx', import.meta.url), 'utf8');
  assert.match(source, /RIPODOC_WORKER_AUTH_SECRET/);
  assert.match(source, /docker-compose\.selfhost\.yml/);
  assert.match(source, /archive\/refs\/heads\/main\.zip/);
});

test('dashboard command center remains backed by a verified tenant-scoped server query', async () => {
  const dashboard = await readFile(new URL('../../../web/frontend/src/app/dashboard/page.tsx', import.meta.url), 'utf8');
  const commandCenter = await readFile(new URL('../../../web/frontend/src/components/dashboard/WorkspaceCommandCenter.tsx', import.meta.url), 'utf8');
  assert.match(dashboard, /currentSessionUser/);
  assert.match(dashboard, /listTenantReports\(user\.tenantId\)/);
  assert.match(commandCenter, /api\/reports\//);
  assert.match(commandCenter, /href="\/download"/);
});

test('retired deployment-wide administrator key is absent from safe runtime posture', async () => {
  const original = process.env.RIPODOC_ADMIN_ACCESS_KEY;
  try {
    process.env.RIPODOC_ADMIN_ACCESS_KEY = 'retired-admin-key-must-not-leak';
    const posture = await getSecurityPosture();
    const serialized = JSON.stringify(posture);
    assert.equal(serialized.includes('retired-admin-key-must-not-leak'), false);
    assert.equal('adminAccessKey' in posture, false);
  } finally {
    if (original === undefined) delete process.env.RIPODOC_ADMIN_ACCESS_KEY;
    else process.env.RIPODOC_ADMIN_ACCESS_KEY = original;
  }
});
