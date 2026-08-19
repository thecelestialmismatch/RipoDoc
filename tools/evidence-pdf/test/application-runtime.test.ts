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
const { assessProofOperations, createEvidenceDeliveryReceipt } = await import('../../../web/frontend/src/lib/evidence/operations.ts');

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
    message: 'Access events are emitted as structured stdout logs. Configure PostgreSQL audit storage for hosted deployments or RIPODOC_AUDIT_LOG on a persistent self-hosted runtime.',
  });
  assert.equal('secret' in posture, false);
  assert.equal(JSON.stringify(posture).includes('revoked-1'), false);
});

test('self-hosting route documents server-only worker configuration without exposing private source access', async () => {
  const source = await readFile(new URL('../../../web/frontend/src/app/download/page.tsx', import.meta.url), 'utf8');
  assert.match(source, /RIPODOC_WORKER_AUTH_SECRET/);
  assert.match(source, /docker-compose\.selfhost\.yml/);
  assert.match(source, /href="\/founding-partners"/);
  assert.doesNotMatch(source, /github\.com\/thecelestialmismatch\/RipoDoc/);
  assert.doesNotMatch(source, /archive\/refs\/heads\/main\.zip/);
});

test('dashboard command center remains backed by a verified tenant-scoped server query', async () => {
  const dashboard = await readFile(new URL('../../../web/frontend/src/app/dashboard/page.tsx', import.meta.url), 'utf8');
  const commandCenter = await readFile(new URL('../../../web/frontend/src/components/dashboard/WorkspaceCommandCenter.tsx', import.meta.url), 'utf8');
  assert.match(dashboard, /currentSessionUser/);
  assert.match(dashboard, /listTenantReports\(user\.tenantId\)/);
  assert.match(commandCenter, /api\/reports\//);
  assert.match(commandCenter, /href="\/download"/);
});

test('evidence delivery receipt is manifest-derived, aggregate-only, and safe for a tenant-scoped operator view', async () => {
  const manifest: ReportManifest = {
    ...createManifest('rpt-receipt-0001', '2026-07-02T10:00:00Z'),
    source: {
      system: 'PSA — ConnectWise Manage',
      description: 'Ticket export, Q2 2026',
      capturedAt: '2026-07-01T09:00:00Z',
    },
  };
  const audit = {
    status: 'durable' as const,
    granted: 2,
    denied: 1,
    lastGrantedAt: '2026-07-03T09:30:00Z',
    lastEventAt: '2026-07-03T10:00:00Z',
  };
  const receipt = createEvidenceDeliveryReceipt({
    report: manifest,
    snapshot: assessProofOperations(manifest),
    audit,
    elementId: 'tickets-resolved',
  });
  const serialized = JSON.stringify(receipt);

  assert.deepEqual(receipt.claimReference, {
    id: 'tickets-resolved',
    label: 'Tickets resolved',
    reviewer: 'Priya Raman',
    approvedAt: '2026-07-01T10:00:00Z',
  });
  assert.equal(receipt.sourceDeclaration, 'PSA — ConnectWise Manage · Ticket export, Q2 2026');
  assert.equal(receipt.recipientReference, 'Dana Whitfield · recipient configured');
  assert.equal(receipt.audit, audit);
  assert.equal(serialized.includes(manifest.recipient.email), false);
  assert.equal(serialized.includes('status = closed'), false);
  assert.equal(serialized.includes('NG-1001'), false);
  assert.match(receipt.deliveryCondition, /Recipient proof/);
  assert.match(receipt.expiryCondition, /per recipient-bound delivery link/);

  const receiptComponent = await readFile(new URL('../../../web/frontend/src/components/dashboard/EvidenceDeliveryReceipt.tsx', import.meta.url), 'utf8');
  const dashboard = await readFile(new URL('../../../web/frontend/src/app/dashboard/page.tsx', import.meta.url), 'utf8');
  const workspaceReports = await readFile(new URL('../../../web/frontend/src/lib/workspace/reports.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(receiptComponent, /recipient\.email/);
  assert.doesNotMatch(receiptComponent, /sourceQuery/);
  assert.doesNotMatch(receiptComponent, /evidence\.table/);
  assert.match(dashboard, /listTenantReports\(user\.tenantId\)/);
  assert.match(workspaceReports, /WHERE tenant_id = \$1/);
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

test('founding-partner conversion path is server-protected and avoids arbitrary prospect-report content', async () => {
  const page = await readFile(new URL('../../../web/frontend/src/app/founding-partners/page.tsx', import.meta.url), 'utf8');
  const route = await readFile(new URL('../../../web/frontend/src/app/api/founding-partners/route.ts', import.meta.url), 'utf8');
  const service = await readFile(new URL('../../../web/frontend/src/lib/founder/leads.ts', import.meta.url), 'utf8');
  const crm = await readFile(new URL('../../../web/frontend/src/lib/founder/espocrm.ts', import.meta.url), 'utf8');
  const crmContract = await readFile(new URL('../../../web/frontend/src/lib/founder/espocrm-contract.ts', import.meta.url), 'utf8');
  const crmMigration = await readFile(new URL('../../../migrations/010_create_founding_partner_crm_sync.sql', import.meta.url), 'utf8');
  assert.match(page, /Turnstile/);
  assert.match(page, /name="csrf"/);
  assert.doesNotMatch(page, /name="message"/);
  assert.match(route, /assertSameOriginAndCsrf/);
  assert.match(route, /verifyCaptcha/);
  assert.match(route, /leadIntakeConfigured/);
  assert.match(service, /encryptLeadEmail/);
  assert.match(service, /founding-partner:ip/);
  assert.match(service, /ON CONFLICT \(email_hash\)/);
  assert.match(page, /name="crmSyncConsent"/);
  assert.match(route, /crmSyncConsent: form\.get\('crmSyncConsent'\) === 'yes'/);
  assert.match(route, /syncConsentedLeadToEspoCrm/);
  assert.match(service, /crm_sync_consent/);
  assert.match(crmMigration, /founding_partner_crm_syncs/);
  assert.match(crm, /RIPODOC_ESPOCRM_ALLOWED_HOSTS/);
  assert.match(crm, /isBlockedCrmAddress/);
  assert.doesNotMatch(crmContract, /evidenceToken|recipientHash|reportId|sourceRows/);
});

test('durable hosted audit and founder-evidence migration preserve a scoped operational data model', async () => {
  const migration = await readFile(new URL('../../../migrations/009_create_durable_evidence_and_growth_records.sql', import.meta.url), 'utf8');
  const sink = await readFile(new URL('../../../web/frontend/src/lib/evidence/audit-postgres.ts', import.meta.url), 'utf8');
  assert.match(migration, /evidence_access_audit_head/);
  assert.match(migration, /evidence_access_audit_records/);
  assert.match(migration, /founding_partner_leads/);
  assert.match(migration, /contact_email_ciphertext/);
  assert.match(migration, /founding_partner_events/);
  assert.match(sink, /FOR UPDATE/);
  assert.match(sink, /chainRecord/);
  assert.doesNotMatch(migration, /report_manifest_content/);
});

test('production preflight makes durable hosted dependencies explicit without serializing environment values', async () => {
  const preflight = await readFile(new URL('../../../tools/production-preflight.ts', import.meta.url), 'utf8');
  const health = await readFile(new URL('../../../web/frontend/src/app/api/health/route.ts', import.meta.url), 'utf8');
  assert.match(preflight, /evidence_access_audit_records/);
  assert.match(preflight, /founding_partner_crm_syncs/);
  assert.match(preflight, /private worker reachability/);
  assert.match(preflight, /RIPODOC_AUDIT_BACKEND/);
  assert.match(preflight, /founding-partner contact encryption/);
  assert.match(preflight, /RIPODOC_LEAD_ENCRYPTION_KEY/);
  assert.match(health, /status: 'ok'/);
  assert.doesNotMatch(health, /hostedReadiness|authConfigured|getSecurityPosture|process\.env/);
  assert.doesNotMatch(preflight, /process\.env\.[A-Z_]+\s*[,}]/);
});

test('self-hosted environment template and operations guidance preserve the complete runtime-only production gate', async () => {
  const environmentTemplate = await readFile(new URL('../../../.env.example', import.meta.url), 'utf8');
  const readme = await readFile(new URL('../../../README.md', import.meta.url), 'utf8');
  const operations = await readFile(new URL('../../../docs/05-engineering/self-hosted-operations-runbook.md', import.meta.url), 'utf8');
  for (const variable of [
    'POSTGRES_PASSWORD',
    'RIPODOC_AUTH_SECRET',
    'RIPODOC_EVIDENCE_SECRET',
    'RIPODOC_WORKER_AUTH_SECRET',
    'RIPODOC_LEAD_ENCRYPTION_KEY',
    'RIPODOC_APP_ORIGIN',
    'RIPODOC_RESEND_API_KEY',
    'RIPODOC_EMAIL_FROM',
    'RIPODOC_TURNSTILE_SECRET',
    'NEXT_PUBLIC_RIPODOC_TURNSTILE_SITE_KEY',
  ]) assert.match(environmentTemplate, new RegExp(`^${variable}=`, 'm'));
  assert.match(readme, /cp \.env\.example \.env/);
  assert.match(readme, /node --experimental-strip-types tools\/production-preflight\.ts/);
  assert.match(operations, /node --experimental-strip-types tools\/production-preflight\.ts/);
});

test('isolated EspoCRM template uses a versioned application image rather than a floating latest tag', async () => {
  const template = await readFile(new URL('../../../deploy/espocrm/.env.example', import.meta.url), 'utf8');
  assert.match(template, /^ESPOCRM_IMAGE=espocrm\/espocrm:\d+\.\d+\.\d+-apache$/m);
  assert.doesNotMatch(template, /^ESPOCRM_IMAGE=.*:latest$/m);
});

test('founding-partner contact encryption authenticates encrypted email at rest with a dedicated key', async () => {
  const original = process.env.RIPODOC_LEAD_ENCRYPTION_KEY;
  try {
    process.env.RIPODOC_LEAD_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64url');
    const { decryptLeadEmail, encryptLeadEmail, leadIntakeConfigured } = await import('../../../web/frontend/src/lib/founder/lead-crypto.ts');
    const encrypted = encryptLeadEmail('owner@example.test');
    assert.equal(leadIntakeConfigured(), true);
    assert.notEqual(encrypted.ciphertext, 'owner@example.test');
    assert.equal(decryptLeadEmail(encrypted), 'owner@example.test');
  } finally {
    if (original === undefined) delete process.env.RIPODOC_LEAD_ENCRYPTION_KEY;
    else process.env.RIPODOC_LEAD_ENCRYPTION_KEY = original;
  }
});

test('legal hub exposes all required pre-launch policy-status routes and keeps unsupported contract language out of the public model', async () => {
  const legal = await readFile(new URL('../../../web/frontend/src/lib/launch/legal.ts', import.meta.url), 'utf8');
  const hub = await readFile(new URL('../../../web/frontend/src/app/legal/page.tsx', import.meta.url), 'utf8');
  const footer = await readFile(new URL('../../../web/frontend/src/components/Footer.tsx', import.meta.url), 'utf8');
  for (const route of ['/legal/privacy', '/legal/cookies', '/legal/terms', '/legal/refunds', '/legal/sla', '/legal/dpa', '/legal/healthcare-mode-b']) {
    assert.match(legal, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(footer, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(hub, /Pre-launch legal status/);
  assert.match(legal, /not a final contract/);
  assert.doesNotMatch(legal, /HIPAA compliant/i);
  assert.doesNotMatch(legal, /HIPAA certified/i);
});

test('Healthcare Mode B defaults to restrictive public behavior and blocks founding-partner intake and public authoring', async () => {
  const foundingRoute = await readFile(new URL('../../../web/frontend/src/app/api/founding-partners/route.ts', import.meta.url), 'utf8');
  const authoringRoute = await readFile(new URL('../../../web/frontend/src/app/api/authoring/[action]/route.ts', import.meta.url), 'utf8');
  const healthcarePage = await readFile(new URL('../../../web/frontend/src/app/legal/[document]/page.tsx', import.meta.url), 'utf8');
  const legal = await readFile(new URL('../../../web/frontend/src/lib/launch/legal.ts', import.meta.url), 'utf8');
  assert.match(foundingRoute, /healthcareModeBEnabled\(\)/);
  assert.match(authoringRoute, /modeBPrivateAuthoringAllowed\(\)/);
  assert.match(authoringRoute, /does not permit public authoring/);
  assert.match(legal, /not a HIPAA certification/);
  assert.match(healthcarePage, /No PHI\/ePHI/);
});

test('outbound webhook destinations require exact allowlisted HTTPS hosts and exclude local or credentialed URLs', async () => {
  const { approvedWebhookDestination, parseWebhookAllowedHosts, webhooksEnabled } = await import('../../../web/frontend/src/lib/launch/healthcare-webhooks.ts');
  const allowed = parseWebhookAllowedHosts('hooks.example.test, events.example.test');
  assert.equal(approvedWebhookDestination('https://hooks.example.test/receive', allowed)?.hostname, 'hooks.example.test');
  assert.equal(approvedWebhookDestination('https://sub.hooks.example.test/receive', allowed), undefined);
  assert.equal(approvedWebhookDestination('http://hooks.example.test/receive', allowed), undefined);
  assert.equal(approvedWebhookDestination('https://hooks.example.test:8443/receive', allowed), undefined);
  assert.equal(approvedWebhookDestination('https://user:pass@hooks.example.test/receive', allowed), undefined);
  assert.equal(approvedWebhookDestination('https://127.0.0.1/receive', new Set(['127.0.0.1'])), undefined);
  const oldMode = process.env.RIPODOC_HEALTHCARE_MODE;
  const oldEnabled = process.env.RIPODOC_WEBHOOKS_ENABLED;
  const oldHosts = process.env.RIPODOC_WEBHOOK_ALLOWED_HOSTS;
  try {
    process.env.RIPODOC_HEALTHCARE_MODE = 'mode-b';
    process.env.RIPODOC_WEBHOOKS_ENABLED = 'true';
    process.env.RIPODOC_WEBHOOK_ALLOWED_HOSTS = 'hooks.example.test';
    assert.equal(webhooksEnabled(), false);
  } finally {
    if (oldMode === undefined) delete process.env.RIPODOC_HEALTHCARE_MODE; else process.env.RIPODOC_HEALTHCARE_MODE = oldMode;
    if (oldEnabled === undefined) delete process.env.RIPODOC_WEBHOOKS_ENABLED; else process.env.RIPODOC_WEBHOOKS_ENABLED = oldEnabled;
    if (oldHosts === undefined) delete process.env.RIPODOC_WEBHOOK_ALLOWED_HOSTS; else process.env.RIPODOC_WEBHOOK_ALLOWED_HOSTS = oldHosts;
  }
});

test('future inbound webhook verification enforces timestamp skew and constant-time HMAC signature shape', async () => {
  const { createHmac } = await import('node:crypto');
  const { verifyInboundWebhook, webhookPayloadTooLarge } = await import('../../../web/frontend/src/lib/launch/healthcare-webhooks.ts');
  const secret = 's'.repeat(32);
  const body = '{"event":"safe"}';
  const timestamp = '1700000000';
  const signature = `sha256=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`;
  assert.equal(verifyInboundWebhook({ rawBody: body, timestamp, signature, secret, now: 1700000000 }), true);
  assert.equal(verifyInboundWebhook({ rawBody: body, timestamp, signature, secret, now: 1700000401 }), false);
  assert.equal(verifyInboundWebhook({ rawBody: body, timestamp, signature: 'sha256=bad', secret, now: 1700000000 }), false);
  assert.equal(webhookPayloadTooLarge('65536'), false);
  assert.equal(webhookPayloadTooLarge('65537'), true);
  assert.equal(webhookPayloadTooLarge(null), true);
});


test('public launch surfaces provide accessible accept, reject, and settings controls while optional tracking remains disabled', async () => {
  const notice = await readFile(new URL('../../../web/frontend/src/components/CookieNotice.tsx', import.meta.url), 'utf8');
  const footer = await readFile(new URL('../../../web/frontend/src/components/Footer.tsx', import.meta.url), 'utf8');
  const settingsButton = await readFile(new URL('../../../web/frontend/src/components/CookieSettingsButton.tsx', import.meta.url), 'utf8');
  const legalPage = await readFile(new URL('../../../web/frontend/src/app/legal/[document]/page.tsx', import.meta.url), 'utf8');
  const layout = await readFile(new URL('../../../web/frontend/src/app/layout.tsx', import.meta.url), 'utf8');
  assert.match(notice, /Cookie choice/);
  assert.match(notice, />\s*Accept/);
  assert.match(notice, />\s*Reject/);
  assert.match(notice, /Cookie settings/);
  assert.match(notice, /localStorage/);
  assert.match(notice, /analytics: false/);
  assert.match(notice, /marketing: false/);
  assert.match(notice, /role="dialog"/);
  assert.match(notice, /aria-modal="true"/);
  assert.match(notice, /href="\/legal\/cookies"/);
  assert.match(footer, /<CookieSettingsButton \/>/);
  assert.match(settingsButton, /OPEN_COOKIE_SETTINGS_EVENT/);
  assert.match(legalPage, /ripodoc-cookie-preferences-v1/);
  assert.match(legalPage, /accept, reject, and cookie-settings controls/);
  assert.match(layout, /<CookieNotice \/>/);
});
test('discovery and authentication boundaries explicitly separate indexable public entity content from private product routes', async () => {
  const robots = await readFile(new URL('../../../web/frontend/src/app/robots.ts', import.meta.url), 'utf8');
  const sitemap = await readFile(new URL('../../../web/frontend/src/app/sitemap.ts', import.meta.url), 'utf8');
  const about = await readFile(new URL('../../../web/frontend/src/app/about/page.tsx', import.meta.url), 'utf8');
  const llms = await readFile(new URL('../../../web/frontend/src/app/llms.txt/route.ts', import.meta.url), 'utf8');
  const config = await readFile(new URL('../../../web/frontend/next.config.ts', import.meta.url), 'utf8');
  const proxy = await readFile(new URL('../../../web/frontend/src/proxy.ts', import.meta.url), 'utf8');
  const indexNowWorkflow = await readFile(new URL('../../../.github/workflows/indexnow-production.yml', import.meta.url), 'utf8');
  const indexNowKey = await readFile(new URL('../../../web/frontend/public/f0cf1c91d611e53368f14a952ee0551092ce9922f9866ded9fea39f468a97e92.txt', import.meta.url), 'utf8');
  const footer = await readFile(new URL('../../../web/frontend/src/components/Footer.tsx', import.meta.url), 'utf8');
  const guide = await readFile(new URL('../../../web/frontend/src/app/guides/msp-client-reporting-qbr-metric-evidence/page.tsx', import.meta.url), 'utf8');
  assert.match(robots, /OAI-SearchBot/);
  assert.match(robots, /'\/about'/);
  assert.match(robots, /'\/llms\.txt'/);
  assert.match(robots, /'\/report-diagnostic-starter-kit'/);
  assert.match(robots, /'\/legal\/healthcare-mode-b'/);
  assert.match(robots, /'\/guides\/msp-client-reporting-qbr-metric-evidence'/);
  assert.match(robots, /'\/dashboard'/);
  assert.match(sitemap, /lastModified/);
  assert.match(sitemap, /const lastSignificantUpdate = new Date\(\)/);
  assert.match(sitemap, /\/about/);
  assert.match(sitemap, /\/report-diagnostic-starter-kit/);
  assert.match(sitemap, /\/guides\/msp-client-reporting-qbr-metric-evidence/);
  assert.match(about, /RipoDoc is controlled evidence delivery for MSP client reports/);
  assert.match(about, /AboutPage/);
  assert.match(llms, /About RipoDoc/);
  assert.match(llms, /Report diagnostic starter kit/);
  assert.match(config, /X-Robots-Tag/);
  assert.match(config, /noindex, nofollow, noarchive, nosnippet/);
  assert.match(config, /'\/dashboard\/:path\*'/);
  assert.match(config, /'\/e\/:path\*'/);
  assert.match(proxy, /TOKENIZED_EVIDENCE_PREFIX/);
  assert.match(proxy, /noindex, nofollow, noarchive, nosnippet/);
  assert.match(indexNowWorkflow, /deployment_status/);
  assert.match(indexNowWorkflow, /environment == 'Production'/);
  assert.match(indexNowWorkflow, /tools\/discovery\/submit-indexnow\.mjs/);
  assert.equal(indexNowKey.trim(), 'f0cf1c91d611e53368f14a952ee0551092ce9922f9866ded9fea39f468a97e92');
  assert.match(footer, /QBR metric evidence guide/);
  assert.match(guide, /MSP client reporting: when a QBR metric needs evidence/);
  assert.match(guide, /FAQPage/);
  assert.match(guide, /fixture data, not a customer deployment/i);
  assert.match(guide, /not a replacement for a PSA, RMM, BI platform, general client portal/i);
});

test('MSP launch page preserves RipoDoc’s narrow evidence-delivery boundary and sample-data warning', async () => {
  const page = await readFile(new URL('../../../web/frontend/src/app/for-msps/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /controlled evidence-delivery layer/);
  assert.match(page, /does not claim to do/);
  assert.match(page, /The public demonstration uses sample data/);
  assert.match(page, /not a blanket compliance certification/);
  assert.match(page, /Use the report diagnostic kit/);
  assert.match(page, /\/report-diagnostic-starter-kit/);
});

test('MSP launch page keeps explicit responsive ratios and page-level overflow protection', async () => {
  const page = await readFile(new URL('../../../web/frontend/src/app/for-msps/page.tsx', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../../../web/frontend/src/app/globals.css', import.meta.url), 'utf8');
  assert.match(page, /lg:grid-cols-\[minmax\(0,1\.08fr\)_minmax\(22rem,\.92fr\)\]/);
  assert.match(page, /lg:grid-cols-\[minmax\(0,\.72fr\)_minmax\(0,1\.28fr\)\]/);
  assert.match(page, /lg:grid-cols-\[minmax\(0,1\.12fr\)_minmax\(18rem,\.88fr\)\]/);
  assert.match(page, /lg:grid-cols-3/);
  assert.match(styles, /\.ledger-page \{ min-width: 0; overflow-x: clip; \}/);
  assert.match(styles, /\.ledger-wrap \{ box-sizing: border-box; margin-inline: auto; max-width: 84rem; padding-inline: 1\.25rem; width: 100%; \}/);
  assert.match(styles, /@media \(min-width: 1024px\) \{\n  \.ledger-wrap \{ padding-inline: 2rem; \}/);
});

test('shared application shell and self-host page preserve the sitewide mobile gutter boundary', async () => {
  const layout = await readFile(new URL('../../../web/frontend/src/app/layout.tsx', import.meta.url), 'utf8');
  const download = await readFile(new URL('../../../web/frontend/src/app/download/page.tsx', import.meta.url), 'utf8');
  assert.match(layout, /<main className="min-w-0 flex-1">/);
  assert.match(download, /ledger-page ledger-field/);
  assert.match(download, /ledger-wrap grid gap-12/);
  assert.match(download, /minmax\(0,1fr\)_minmax\(0,\.98fr\)/);
  assert.match(download, /max-w-full overflow-x-auto/);
  assert.match(download, /<code className="block min-w-max">/);
});

test('report diagnostic starter kit provides a no-data five-question conversion resource', async () => {
  const kit = await readFile(new URL('../../../web/frontend/src/app/report-diagnostic-starter-kit/page.tsx', import.meta.url), 'utf8');
  const partners = await readFile(new URL('../../../web/frontend/src/app/founding-partners/page.tsx', import.meta.url), 'utf8');
  const footer = await readFile(new URL('../../../web/frontend/src/components/Footer.tsx', import.meta.url), 'utf8');
  assert.match(kit, /MSP report diagnostic starter kit/);
  assert.match(kit, /Name the claim/);
  assert.match(kit, /Do not paste client names, credentials, report files/);
  assert.match(partners, /Use the starter kit/);
  assert.match(footer, /Report diagnostic starter kit/);
});

test('README uses the approved mark, authentic demo assets, and the permissioned-source boundary', async () => {
  const readme = await readFile(new URL('../../../README.md', import.meta.url), 'utf8');
  assert.match(readme, /web\/frontend\/public\/ripodoc-mark\.png/);
  assert.match(readme, /docs\/assets\/ripodoc-claim-sample\.png/);
  assert.match(readme, /docs\/assets\/ripodoc-demo-tour\.mp4/);
  assert.match(readme, /shipped fixture data/);
  assert.match(readme, /Source access is intentionally permissioned/);
  assert.doesNotMatch(readme, /github\.com\/thecelestialmismatch\/RipoDoc/);
});


test('interactive sample keeps evidence vertically composed through tablet widths and renders row cards on mobile', async () => {
  const sample = await readFile(new URL('../../../web/frontend/src/components/marketing/SampleReport.tsx', import.meta.url), 'utf8');
  const grid = await readFile(new URL('../../../web/frontend/src/components/evidence/EvidenceGrid.tsx', import.meta.url), 'utf8');

  assert.match(sample, /2xl:grid-cols/);
  assert.match(sample, /below the report on mobile/);
  assert.match(grid, /md:hidden/);
  assert.match(grid, /hidden overflow-x-auto md:block/);
  assert.match(grid, /break-words/);
});

test('authoring begins only inside a verified workspace and preserves the approved post-login return path', async () => {
  const upload = await readFile(new URL('../../../web/frontend/src/app/upload/page.tsx', import.meta.url), 'utf8');
  const workspace = await readFile(new URL('../../../web/frontend/src/components/authoring/UploadWorkspace.tsx', import.meta.url), 'utf8');
  const login = await readFile(new URL('../../../web/frontend/src/app/login/page.tsx', import.meta.url), 'utf8');
  const auth = await readFile(new URL('../../../web/frontend/src/app/api/auth/[action]/route.ts', import.meta.url), 'utf8');

  assert.match(upload, /currentSessionUser/);
  assert.match(upload, /redirect\('\/login\?next=\/upload'\)/);
  assert.match(upload, /UploadWorkspace/);
  assert.doesNotMatch(upload, /'use client'/);
  assert.match(workspace, /'use client'/);
  assert.match(login, /const safeNext = .*value === '\/upload'/);
  assert.match(login, /name="next"/);
  assert.match(auth, /const safePostLoginPath = .*value === '\/upload'/);
  assert.match(auth, /destination\(request, postLoginPath, 'ok'\)/);
});

test('homepage keeps the interactive proof fixture out of the critical response path', async () => {
  const home = await readFile(new URL('../../../web/frontend/src/app/page.tsx', import.meta.url), 'utf8');
  const deferred = await readFile(new URL('../../../web/frontend/src/components/marketing/DeferredSampleReport.tsx', import.meta.url), 'utf8');
  const fixture = await readFile(new URL('../../../web/frontend/src/components/marketing/SampleReportFixture.tsx', import.meta.url), 'utf8');

  assert.match(home, /<DeferredSampleReport \/>/);
  assert.doesNotMatch(home, /loadManifest|SampleReport manifest/);
  assert.match(deferred, /dynamic\(/);
  assert.match(deferred, /IntersectionObserver/);
  assert.match(fixture, /rpt-demo-0001\.json/);
  assert.match(fixture, /<SampleReport manifest=\{manifest\} \/>/);
});

test('homepage red surfaces keep normal body and CTA detail text above the measured contrast threshold', async () => {
  const home = await readFile(new URL('../../../web/frontend/src/app/page.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(home, /text-\[#f8f0df\]\/88/);
  assert.doesNotMatch(home, /text-\[#f8f0df\]\/86/);
  assert.doesNotMatch(home, /text-\[#f8f0df\]\/82/);
  assert.doesNotMatch(home, /highlight \? 'text-\[#f8f0df\]\/78'/);
  assert.match(home, /text-\[#141111\]/);
});

test('repository governance defines an accountable owner and recurring dependency maintenance', async () => {
  const owners = await readFile(new URL('../../../.github/CODEOWNERS', import.meta.url), 'utf8');
  const dependabot = await readFile(new URL('../../../.github/dependabot.yml', import.meta.url), 'utf8');

  assert.match(owners, /^\* @thecelestialmismatch/m);
  assert.match(dependabot, /package-ecosystem: npm/);
  assert.match(dependabot, /directory: "\/web\/frontend"/);
  assert.match(dependabot, /package-ecosystem: github-actions/);
  assert.match(dependabot, /interval: weekly/);
});

test('public brand lockups preserve dark-surface legibility and red-surface accessible contrast', async () => {
  const footer = await readFile(new URL('../../../web/frontend/src/components/Footer.tsx', import.meta.url), 'utf8');
  const brandLockup = await readFile(new URL('../../../web/frontend/src/components/BrandLockup.tsx', import.meta.url), 'utf8');

  assert.match(footer, /<BrandLockup showDescriptor inverse \/>/);
  assert.match(brandLockup, /readonly inverse\?: boolean/);
  assert.match(brandLockup, /readonly onAccent\?: boolean/);
  assert.match(brandLockup, /onAccent \? 'text-\[#141111\]' : 'text-\[#fffdf8\]'/);
  assert.match(brandLockup, /const iconFrame = compact \? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-12 w-12';/);
  assert.match(brandLockup, /className="block h-full w-full object-contain"/);
  assert.match(footer, /<Link href="\/download"/);
  assert.match(footer, /Review the self-hosted build/);
  assert.doesNotMatch(footer, /github\.com\/thecelestialmismatch\/RipoDoc/);
});
