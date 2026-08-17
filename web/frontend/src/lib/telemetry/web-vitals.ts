export const WEB_VITAL_NAMES = ['CLS', 'FCP', 'INP', 'LCP', 'TTFB'] as const;
export type WebVitalName = typeof WEB_VITAL_NAMES[number];
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

export interface PublicWebVital {
  readonly name: WebVitalName;
  readonly value: number;
  readonly rating: WebVitalRating;
  readonly navigationType: string;
}

const validRating = (value: unknown): value is WebVitalRating => value === 'good' || value === 'needs-improvement' || value === 'poor';
const validName = (value: unknown): value is WebVitalName => typeof value === 'string' && WEB_VITAL_NAMES.includes(value as WebVitalName);

/**
 * Accept only anonymous metric values. Visitor IDs, report URLs, tokens, raw
 * user agents, recipient identities, and evidence data are intentionally absent.
 */
export const parsePublicWebVital = (value: unknown): PublicWebVital | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Record<string, unknown>;
  if (!validName(candidate.name) || !validRating(candidate.rating) || typeof candidate.value !== 'number' || !Number.isFinite(candidate.value) || candidate.value < 0 || candidate.value > 60_000) return undefined;
  if (typeof candidate.navigationType !== 'string' || candidate.navigationType.length > 32) return undefined;
  return { name: candidate.name, value: candidate.value, rating: candidate.rating, navigationType: candidate.navigationType };
};
