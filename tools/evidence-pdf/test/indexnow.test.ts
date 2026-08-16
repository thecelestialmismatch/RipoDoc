import assert from 'node:assert/strict';
import test from 'node:test';
import {
  INDEXNOW_PUBLIC_PATHS,
  assertIndexNowKey,
  buildIndexNowPayload,
  submitIndexNow,
} from '../../discovery/submit-indexnow.mjs';

const key = 'f0cf1c91d611e53368f14a952ee0551092ce9922f9866ded9fea39f468a97e92';

test('IndexNow payload only announces the canonical public RipoDoc URLs', () => {
  const payload = buildIndexNowPayload({ key });
  assert.equal(payload.host, 'www.ripodoc.com');
  assert.equal(payload.keyLocation, `https://www.ripodoc.com/${key}.txt`);
  assert.equal(payload.urlList.length, INDEXNOW_PUBLIC_PATHS.length);
  assert.ok(payload.urlList.every((url) => url.startsWith('https://www.ripodoc.com/')));
  assert.ok(payload.urlList.includes('https://www.ripodoc.com/for-msps'));
  assert.ok(!payload.urlList.some((url) => url.includes('/dashboard')));
});

test('IndexNow rejects malformed keys, non-canonical origins, and unsafe path values', () => {
  assert.throws(() => assertIndexNowKey('unsafe key'), /INDEXNOW_KEY/);
  assert.throws(() => buildIndexNowPayload({ key, origin: 'https://ripodoc.com' }), /canonical/);
  assert.throws(() => buildIndexNowPayload({ key, paths: ['/about', 'https://example.com/'] }), /absolute paths/);
});

test('IndexNow accepts 202 validation-pending responses and submits a JSON batch', async () => {
  let received: { url: string; init: RequestInit } | undefined;
  const result = await submitIndexNow({
    key,
    paths: ['/about', '/for-msps'],
    fetchImpl: async (url, init) => {
      received = { url: String(url), init: init ?? {} };
      return new Response('', { status: 202 });
    },
  });
  assert.equal(result.status, 202);
  assert.equal(result.count, 2);
  assert.ok(received);
  assert.equal(received.url, 'https://api.indexnow.org/indexnow');
  assert.equal(received.init.method, 'POST');
  assert.deepEqual(JSON.parse(String(received.init.body)), {
    host: 'www.ripodoc.com',
    key,
    keyLocation: `https://www.ripodoc.com/${key}.txt`,
    urlList: ['https://www.ripodoc.com/about', 'https://www.ripodoc.com/for-msps'],
  });
});

test('IndexNow rejects a non-accepted response without exposing the key in its failure', async () => {
  await assert.rejects(
    submitIndexNow({ key, fetchImpl: async () => new Response('bad request', { status: 400 }) }),
    /HTTP 400: bad request/,
  );
});
