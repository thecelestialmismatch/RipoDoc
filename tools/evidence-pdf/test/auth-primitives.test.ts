import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, privacyHash, randomToken, tokenHash, validatePassword, verifyPassword } from '../../../web/frontend/src/lib/auth/primitives.ts';

process.env.RIPODOC_AUTH_SECRET = 'test-auth-secret-that-is-long-enough-to-be-safe';

test('passwords use a parameterized scrypt format and never verify the wrong value', async () => {
  const encoded = await hashPassword('a sufficiently long test passphrase');
  assert.match(encoded, /^scrypt\$32768\$8\$1\$/);
  assert.equal(await verifyPassword('a sufficiently long test passphrase', encoded), true);
  assert.equal(await verifyPassword('an incorrect test passphrase', encoded), false);
});

test('one-time tokens are high-entropy, server-hashed, and input validation is strict', () => {
  const token = randomToken();
  assert.ok(token.length >= 40);
  assert.notEqual(tokenHash(token), token);
  assert.equal(tokenHash(token), tokenHash(token));
  assert.notEqual(privacyHash('one@example.com'), privacyHash('two@example.com'));
  assert.equal(validatePassword('short'), 'Use a passphrase of at least 15 characters.');
  assert.equal(validatePassword('a sufficiently long test passphrase'), undefined);
});
