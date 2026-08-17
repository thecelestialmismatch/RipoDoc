'use client';

import { useReportWebVitals } from 'next/web-vitals';

const enabled = process.env.NEXT_PUBLIC_RIPODOC_WEB_VITALS_ENABLED === 'true';
const allowed = new Set(['CLS', 'FCP', 'INP', 'LCP', 'TTFB']);
const ratings = new Set(['good', 'needs-improvement', 'poor']);

/**
 * Opt-in field measurement. The payload intentionally excludes visitor IDs,
 * recipient data, report URLs, tokens, and raw user-agent strings.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!enabled || !allowed.has(metric.name) || !ratings.has(metric.rating)) return;
    const body = JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating, navigationType: metric.navigationType ?? 'navigate' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/telemetry/web-vitals', new Blob([body], { type: 'application/json' }));
      return;
    }
    void fetch('/api/telemetry/web-vitals', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true, credentials: 'same-origin' });
  });
  return null;
}
