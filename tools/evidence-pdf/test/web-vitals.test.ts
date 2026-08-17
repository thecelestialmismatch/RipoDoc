import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePublicWebVital } from '../../../web/frontend/src/lib/telemetry/web-vitals.ts';

test('accepts a bounded anonymous Core Web Vital payload and strips extraneous fields', () => {
  const metric = parsePublicWebVital({
    name: 'LCP',
    value: 1825.4,
    rating: 'good',
    navigationType: 'navigate',
    recipient: 'must-not-survive',
    token: 'must-not-survive',
  });
  assert.deepEqual(metric, { name: 'LCP', value: 1825.4, rating: 'good', navigationType: 'navigate' });
});

test('rejects unsupported metrics, invalid ratings, excessive values, and unbounded navigation metadata', () => {
  assert.equal(parsePublicWebVital({ name: 'custom', value: 1, rating: 'good', navigationType: 'navigate' }), undefined);
  assert.equal(parsePublicWebVital({ name: 'CLS', value: 1, rating: 'unknown', navigationType: 'navigate' }), undefined);
  assert.equal(parsePublicWebVital({ name: 'FCP', value: 60_001, rating: 'poor', navigationType: 'navigate' }), undefined);
  assert.equal(parsePublicWebVital({ name: 'TTFB', value: 120, rating: 'good', navigationType: 'x'.repeat(33) }), undefined);
});
