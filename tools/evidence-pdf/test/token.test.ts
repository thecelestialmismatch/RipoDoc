import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  failureMessage,
  hashRecipient,
  issueClaims,
  signEvidenceToken,
  verifyEvidenceToken,
} from '../../../web/frontend/src/lib/evidence/token.ts';

const SECRET = 'test-secret-that-is-long-enough-to-pass-32';
const OTHER_SECRET = 'a-different-secret-also-long-enough-here-x';
const NOW = 1_800_000_000;

const claims = () =>
  issueClaims({
    reportId: 'rpt-demo-0001',
    version: 3,
    recipientEmail: 'Dana.Whitfield@example.com',
    issuedAt: NOW,
    ttlSeconds: 14 * 24 * 60 * 60,
    jti: 'fixed-jti-01',
  });

test('a freshly issued token verifies', () => {
  const token = signEvidenceToken(claims(), SECRET);
  const result = verifyEvidenceToken(token, SECRET, { now: NOW });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.claims.reportId, 'rpt-demo-0001');
    assert.equal(result.claims.version, 3);
  }
});

test('recipient email is bound but never embedded in the token', () => {
  const token = signEvidenceToken(claims(), SECRET);
  const decoded = Buffer.from(token.split('.')[0] ?? '', 'base64url').toString('utf8');
  assert.ok(!decoded.toLowerCase().includes('dana'), 'raw email must not appear in the token');
  assert.ok(decoded.includes(hashRecipient('dana.whitfield@example.com')));
});

test('recipient hashing is case- and whitespace-insensitive', () => {
  assert.equal(hashRecipient('  DANA@Example.COM '), hashRecipient('dana@example.com'));
});

test('a token signed with another secret is rejected', () => {
  const token = signEvidenceToken(claims(), OTHER_SECRET);
  const result = verifyEvidenceToken(token, SECRET, { now: NOW });
  assert.deepEqual(result, { ok: false, reason: 'bad-signature' });
});

test('tampering with the payload is rejected', () => {
  const token = signEvidenceToken(claims(), SECRET);
  const [, signature] = token.split('.');
  const forged = Buffer.from(
    JSON.stringify(['rpt-other-0002', 3, hashRecipient('x@y.com'), NOW + 999, 'j']),
    'utf8',
  ).toString('base64url');
  const result = verifyEvidenceToken(`${forged}.${signature}`, SECRET, { now: NOW });
  assert.deepEqual(result, { ok: false, reason: 'bad-signature' });
});

test('an expired token is rejected', () => {
  const token = signEvidenceToken(claims(), SECRET);
  const result = verifyEvidenceToken(token, SECRET, { now: NOW + 15 * 24 * 60 * 60 });
  assert.deepEqual(result, { ok: false, reason: 'expired' });
});

test('expiry is exclusive at the exact boundary', () => {
  const issued = claims();
  const token = signEvidenceToken(issued, SECRET);
  assert.equal(verifyEvidenceToken(token, SECRET, { now: issued.expiresAt - 1 }).ok, true);
  assert.equal(verifyEvidenceToken(token, SECRET, { now: issued.expiresAt }).ok, false);
});

test('a revoked token id is rejected even before expiry', () => {
  const token = signEvidenceToken(claims(), SECRET);
  const result = verifyEvidenceToken(token, SECRET, {
    now: NOW,
    revoked: new Set(['fixed-jti-01']),
  });
  assert.deepEqual(result, { ok: false, reason: 'revoked' });
});

test('a token for another report is rejected when a report is expected', () => {
  const token = signEvidenceToken(claims(), SECRET);
  const result = verifyEvidenceToken(token, SECRET, {
    now: NOW,
    expectReportId: 'rpt-someone-else',
  });
  assert.deepEqual(result, { ok: false, reason: 'wrong-report' });
});

test('malformed tokens are rejected without throwing', () => {
  for (const bad of ['', '.', 'no-dot', 'a.b.c', 'onlypayload.', '.onlysignature']) {
    const result = verifyEvidenceToken(bad, SECRET, { now: NOW });
    assert.equal(result.ok, false, `expected rejection for ${JSON.stringify(bad)}`);
  }
});

test('signing refuses a weak secret', () => {
  assert.throws(() => signEvidenceToken(claims(), 'too-short'), /at least 32/);
});

test('every failure reason has a recipient-safe message', () => {
  for (const reason of ['malformed', 'bad-signature', 'expired', 'wrong-report', 'revoked'] as const) {
    const message = failureMessage(reason);
    assert.ok(message.length > 0);
    assert.ok(!message.includes('signature'), 'must not leak internals to the recipient');
  }
});
