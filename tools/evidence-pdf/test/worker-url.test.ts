import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePrivateWorkerBaseUrl } from '../../../web/frontend/src/lib/authoring/worker-url.ts';

test('production accepts only an explicitly allowed internal worker /api/local origin', () => {
  assert.equal(
    normalizePrivateWorkerBaseUrl('http://worker:4000/api/local/', { environment: 'production', allowedProductionHosts: ['worker'] }),
    'http://worker:4000/api/local',
  );
  assert.equal(
    normalizePrivateWorkerBaseUrl('https://authoring.internal.example/api/local', { environment: 'production', allowedProductionHosts: ['authoring.internal.example'] }),
    'https://authoring.internal.example/api/local',
  );
});

test('production rejects public, credential-bearing, malformed, and non-worker endpoints', () => {
  const policy = { environment: 'production', allowedProductionHosts: ['worker'] } as const;
  for (const value of [
    'https://example.com/api/local',
    'https://worker:secret@worker/api/local',
    'https://worker/api/local?target=other',
    'https://worker/api/local#fragment',
    'https://worker/api/other',
    'file:///api/local',
    'not a url',
  ]) assert.equal(normalizePrivateWorkerBaseUrl(value, policy), undefined, value);
});

test('development retains an isolated loopback fallback but production does not', () => {
  assert.equal(
    normalizePrivateWorkerBaseUrl(undefined, { environment: 'development' }),
    'http://127.0.0.1:4000/api/local',
  );
  assert.equal(normalizePrivateWorkerBaseUrl(undefined, { environment: 'production', allowedProductionHosts: ['worker'] }), undefined);
});
