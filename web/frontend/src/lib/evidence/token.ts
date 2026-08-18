/**
 * Recipient-bound evidence tokens.
 *
 * A public link that grants permanent access to anyone who holds it is not an
 * appropriate evidence-delivery boundary. This module enforces a scoped,
 * recipient-aware answer path instead.
 *
 * A token binds four things — report, version, recipient, expiry — under an
 * HMAC. It is *not* a bearer secret lookup: the claims travel in the token and
 * are verified, so a revoked or expired link fails closed without a round trip.
 *
 * Threat notes:
 *  - Signed with HMAC-SHA256 over a canonical payload; the separator `.` cannot
 *    appear in base64url, so claim boundaries are unambiguous.
 *  - Compared with `timingSafeEqual` to avoid leaking the signature byte-by-byte.
 *  - The recipient email is *hashed*, not embedded: a token that leaks must not
 *    also leak who it was for.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export interface EvidenceClaims {
  readonly reportId: string;
  readonly version: number;
  /** SHA-256 of the lowercased recipient email, hex. */
  readonly recipientHash: string;
  /** Unix seconds. */
  readonly expiresAt: number;
  /** Random per-issue id, so a single link can be revoked without rotating keys. */
  readonly jti: string;
}

export type VerifyFailure =
  | 'malformed'
  | 'bad-signature'
  | 'expired'
  | 'wrong-report'
  | 'revoked';

export type VerifyResult =
  | { readonly ok: true; readonly claims: EvidenceClaims }
  | { readonly ok: false; readonly reason: VerifyFailure };

const base64url = (input: Buffer): string => input.toString('base64url');

const canonical = (claims: EvidenceClaims): string =>
  JSON.stringify([
    claims.reportId,
    claims.version,
    claims.recipientHash,
    claims.expiresAt,
    claims.jti,
  ]);

/** Hash a recipient email for binding. Lowercased and trimmed first. */
export const hashRecipient = (email: string): string =>
  createHmac('sha256', 'ripodoc-recipient').update(email.trim().toLowerCase()).digest('hex');

/** Mint a token. `secret` never leaves the server. */
export const signEvidenceToken = (claims: EvidenceClaims, secret: string): string => {
  if (secret.length < 32) {
    throw new Error('Evidence signing secret must be at least 32 characters');
  }
  const payload = base64url(Buffer.from(canonical(claims), 'utf8'));
  const signature = base64url(createHmac('sha256', secret).update(payload).digest());
  return `${payload}.${signature}`;
};

const parseClaims = (decoded: string): EvidenceClaims | undefined => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    return undefined;
  }
  if (!Array.isArray(parsed) || parsed.length !== 5) return undefined;
  const [reportId, version, recipientHash, expiresAt, jti] = parsed;
  if (
    typeof reportId !== 'string' ||
    typeof version !== 'number' ||
    typeof recipientHash !== 'string' ||
    typeof expiresAt !== 'number' ||
    typeof jti !== 'string'
  ) {
    return undefined;
  }
  return { reportId, version, recipientHash, expiresAt, jti };
};

export interface VerifyOptions {
  /** Unix seconds. Injected so expiry is testable. */
  readonly now: number;
  /** Revoked `jti` values — the instant kill switch. */
  readonly revoked?: ReadonlySet<string>;
  /** If set, the token must be for this report. */
  readonly expectReportId?: string;
}

/** Verify a token. Fails closed on every ambiguity. */
export const verifyEvidenceToken = (
  token: string,
  secret: string,
  options: VerifyOptions,
): VerifyResult => {
  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, reason: 'malformed' };
  const [payload, signature] = parts as [string, string];
  if (payload.length === 0 || signature.length === 0) {
    return { ok: false, reason: 'malformed' };
  }

  const expected = Buffer.from(
    base64url(createHmac('sha256', secret).update(payload).digest()),
    'utf8',
  );
  const provided = Buffer.from(signature, 'utf8');
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return { ok: false, reason: 'bad-signature' };
  }

  const claims = parseClaims(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!claims) return { ok: false, reason: 'malformed' };
  if (options.expectReportId !== undefined && claims.reportId !== options.expectReportId) {
    return { ok: false, reason: 'wrong-report' };
  }
  if (options.revoked?.has(claims.jti) === true) return { ok: false, reason: 'revoked' };
  if (claims.expiresAt <= options.now) return { ok: false, reason: 'expired' };

  return { ok: true, claims };
};

/** Build claims for a fresh link. */
export const issueClaims = (input: {
  readonly reportId: string;
  readonly version: number;
  readonly recipientEmail: string;
  readonly issuedAt: number;
  readonly ttlSeconds: number;
  readonly jti?: string;
}): EvidenceClaims => ({
  reportId: input.reportId,
  version: input.version,
  recipientHash: hashRecipient(input.recipientEmail),
  expiresAt: input.issuedAt + input.ttlSeconds,
  jti: input.jti ?? randomBytes(9).toString('base64url'),
});

/** Human-readable reason, safe to show a recipient without leaking internals. */
export const failureMessage = (reason: VerifyFailure): string => {
  switch (reason) {
    case 'expired':
      return 'This evidence link has expired. Ask your provider to re-share the report.';
    case 'revoked':
      return 'This evidence link has been revoked by the provider.';
    case 'wrong-report':
    case 'bad-signature':
    case 'malformed':
      return 'This evidence link is not valid.';
  }
};
