import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { espocrmAuthorization, espocrmLeadPayload, isBlockedCrmAddress } from '../../../web/frontend/src/lib/founder/espocrm-contract.ts';

const consentedLead = {
  leadId: 'b415ad2e-761d-4636-8ec8-0e39004877aa',
  contactName: 'Ada Lovelace',
  companyName: 'Analytical MSP',
  email: 'ada@example.com',
  companySizeBand: '20-49',
  reportingToolBand: 'msp-reporting',
  interestMode: 'self-hosted',
  source: 'website',
} as const;

test('blocks loopback, private, link-local, carrier-grade, multicast, and non-IP CRM destinations', () => {
  for (const address of ['127.0.0.1', '10.0.0.8', '172.16.4.3', '192.168.1.2', '169.254.7.8', '100.64.0.1', '::1', 'fc00::1', 'fe80::1', 'not-an-ip']) {
    assert.equal(isBlockedCrmAddress(address), true, address);
  }
  assert.equal(isBlockedCrmAddress('8.8.8.8'), false);
  assert.equal(isBlockedCrmAddress('2001:4860:4860::8888'), false);
});

test('constructs EspoCRM HMAC authorization over the exact method and request URI', () => {
  const apiKey = 'api-key-example-that-is-long-enough';
  const secret = 'server-side-secret-that-is-long-enough-for-test';
  const uri = 'Lead?searchParams=%7B%7D';
  const expectedSignature = createHmac('sha256', secret).update(`GET /${uri}`).digest('hex');
  const decoded = Buffer.from(espocrmAuthorization('GET', uri, apiKey, secret), 'base64').toString('utf8');
  assert.equal(decoded, `${apiKey}:${expectedSignature}`);
});

test('maps only consented business-development fields and omits all evidence-delivery data', () => {
  const payload = espocrmLeadPayload(consentedLead);
  assert.deepEqual(payload, {
    firstName: 'Ada',
    lastName: 'Lovelace',
    emailAddress: 'ada@example.com',
    accountName: 'Analytical MSP',
    description: [
      'RipoDoc founding-partner request.',
      'Company size: 20-49.',
      'Current reporting: msp-reporting.',
      'Preferred operating model: self-hosted.',
      'Acquisition source: website.',
      'RipoDoc lead reference: b415ad2e-761d-4636-8ec8-0e39004877aa.',
    ].join('\n'),
  });
  const serialized = JSON.stringify(payload);
  for (const forbidden of ['recipientHash', 'evidenceToken', 'reportId', 'elementId', 'sourceRows', 'RIPODOC_EVIDENCE_SECRET']) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
});
