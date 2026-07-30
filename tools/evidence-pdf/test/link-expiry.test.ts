import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expiryDate, staleExpiryWarning } from '../src/link/base-url.ts';
import type { ReportManifest } from '../../../web/frontend/src/lib/evidence/types.ts';

const manifest = (publishedAt: string) => ({ publishedAt }) as unknown as ReportManifest;

const NOW = new Date('2026-07-27T00:00:00Z');

test('expiry runs from publishedAt, not from the moment of generation', () => {
  // The property that makes a rebuild byte-identical. If this ever changes to
  // Date.now(), every published artifact stops being reproducible.
  const expires = expiryDate(manifest('2026-07-02T09:15:00Z'), 14);
  assert.equal(expires.toISOString().slice(0, 10), '2026-07-16');
});

test('a manifest old enough to have expired is reported, not shipped silently', () => {
  const warning = staleExpiryWarning(expiryDate(manifest('2026-07-02T09:15:00Z'), 14), NOW);
  assert.ok(warning, 'links dated 11 days ago must not pass without a word');
  assert.match(warning, /expired on 2026-07-16/);
  assert.match(warning, /--ttl-days/, 'the warning has to say what to do about it');
});

test('live links produce no warning', () => {
  assert.equal(staleExpiryWarning(expiryDate(manifest('2026-07-20T09:15:00Z'), 14), NOW), undefined);
});

test('expiring exactly now counts as expired', () => {
  // A token whose exp equals the current second is refused by verification, so
  // the generator must agree rather than call it live.
  assert.ok(staleExpiryWarning(NOW, NOW));
});
