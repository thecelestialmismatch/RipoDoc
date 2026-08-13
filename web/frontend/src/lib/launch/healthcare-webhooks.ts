import { createHmac, timingSafeEqual } from 'node:crypto';

const LOCAL_HOSTS = new Set(['localhost', 'localhost.localdomain', '0.0.0.0', '::1']);
const PRIVATE_IPV4 = /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.)/;

export const healthcareModeBEnabled = (): boolean => process.env.RIPODOC_HEALTHCARE_MODE?.toLowerCase() === 'mode-b';

/** Mode B requires an explicit operator decision before any private authoring path may run. */
export const modeBPrivateAuthoringAllowed = (): boolean =>
  healthcareModeBEnabled() && process.env.RIPODOC_MODE_B_ALLOW_PRIVATE_AUTHORING?.toLowerCase() === 'true';

export const parseWebhookAllowedHosts = (value = process.env.RIPODOC_WEBHOOK_ALLOWED_HOSTS ?? ''): ReadonlySet<string> => new Set(
  value.split(',').map((host) => host.trim().toLowerCase()).filter((host) => /^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$/.test(host)),
);

const localOrPrivateHost = (hostname: string): boolean => {
  const host = hostname.toLowerCase();
  return LOCAL_HOSTS.has(host) || host.endsWith('.local') || PRIVATE_IPV4.test(host);
};

/**
 * Exact-host outbound webhook policy. Redirects are intentionally never
 * followed by the future sender; callers must validate the initial URL first.
 */
export const approvedWebhookDestination = (input: string, allowedHosts = parseWebhookAllowedHosts()): URL | undefined => {
  if (allowedHosts.size === 0) return undefined;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return undefined;
    const hostname = url.hostname.toLowerCase();
    if (localOrPrivateHost(hostname) || !allowedHosts.has(hostname)) return undefined;
    return url;
  } catch {
    return undefined;
  }
};

/** Webhook delivery is disabled by default and is never enabled in Mode B. */
export const webhooksEnabled = (): boolean =>
  !healthcareModeBEnabled() && process.env.RIPODOC_WEBHOOKS_ENABLED?.toLowerCase() === 'true' && parseWebhookAllowedHosts().size > 0;

export interface SafeWebhookEvent {
  readonly id: string;
  readonly type: 'report_published' | 'evidence_accessed' | 'workspace_verified';
  readonly occurredAt: string;
  readonly correlationId?: string;
}

export const safeWebhookEvent = (input: SafeWebhookEvent): SafeWebhookEvent | undefined => {
  if (!/^[a-z0-9][a-z0-9_-]{7,95}$/i.test(input.id)) return undefined;
  if (!['report_published', 'evidence_accessed', 'workspace_verified'].includes(input.type)) return undefined;
  if (Number.isNaN(Date.parse(input.occurredAt))) return undefined;
  if (input.correlationId !== undefined && !/^[a-z0-9][a-z0-9_-]{7,95}$/i.test(input.correlationId)) return undefined;
  return input;
};

const equal = (left: Buffer, right: Buffer): boolean => left.length === right.length && timingSafeEqual(left, right);

/**
 * Provider-neutral HMAC verifier for future inbound integrations. A provider
 * must still be explicitly registered and supply its official signature spec.
 */
export const verifyInboundWebhook = (input: {
  readonly rawBody: string;
  readonly timestamp: string | null;
  readonly signature: string | null;
  readonly secret: string | undefined;
  readonly now?: number;
  readonly maxSkewSeconds?: number;
}): boolean => {
  const now = input.now ?? Math.floor(Date.now() / 1_000);
  const maxSkewSeconds = input.maxSkewSeconds ?? 300;
  const timestamp = Number(input.timestamp);
  if (!input.secret || input.secret.length < 32 || !Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > maxSkewSeconds || !input.signature?.startsWith('sha256=')) return false;
  const expected = createHmac('sha256', input.secret).update(`${timestamp}.${input.rawBody}`).digest('hex');
  const supplied = input.signature.slice('sha256='.length);
  return /^[a-f0-9]{64}$/i.test(supplied) && equal(Buffer.from(expected, 'hex'), Buffer.from(supplied, 'hex'));
};

export const webhookPayloadTooLarge = (contentLength: string | null, maximumBytes = 64 * 1024): boolean => {
  const size = Number(contentLength);
  return !Number.isSafeInteger(size) || size < 1 || size > maximumBytes;
};
