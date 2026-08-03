/**
 * Minting the evidence base URL.
 *
 * Shared by both generators — the one that renders a RipoDoc report and the one
 * that overlays links onto a customer's existing PDF — so a link produced by
 * either path carries exactly the same claims and the same expiry semantics.
 *
 * In production the application server mints the token and passes `--base-url`;
 * neither generator should ever hold the signing key. `--origin` exists so a
 * single command can produce a complete artifact for a demo or a teardown.
 */

import { createHash } from 'node:crypto';
import { issueClaims, signEvidenceToken } from '../../../../web/frontend/src/lib/evidence/token.ts';
import type { ReportManifest } from '../../../../web/frontend/src/lib/evidence/types.ts';

export interface BaseUrlInput {
  readonly manifest: ReportManifest;
  /** A pre-signed base URL, if the server already minted one. */
  readonly baseUrl?: string | undefined;
  readonly origin?: string | undefined;
  readonly ttlDays: number;
}

/**
 * A deterministic `jti`, so re-running a build produces the identical file
 * rather than a new token every time. Revocation still works: the id is unique
 * per report, version and recipient.
 */
const deterministicJti = (manifest: ReportManifest): string =>
  createHash('sha256')
    .update(`${manifest.reportId}:${manifest.version}:${manifest.recipient.email}`)
    .digest('base64url')
    .slice(0, 12);

export const mintEvidenceBaseUrl = (input: BaseUrlInput): string => {
  if (input.baseUrl) return input.baseUrl.replace(/\/$/, '');

  const origin = (input.origin ?? 'https://ripodoc.com').replace(/\/$/, '');
  const secret = process.env.RIPODOC_EVIDENCE_SECRET;
  if (!secret) {
    throw new Error(
      'Set RIPODOC_EVIDENCE_SECRET (32+ chars) or pass a pre-signed --base-url. ' +
        'The generator must never invent a secret.',
    );
  }

  const publishedAt = Math.floor(Date.parse(input.manifest.publishedAt) / 1000);
  const claims = issueClaims({
    reportId: input.manifest.reportId,
    version: input.manifest.version,
    recipientEmail: input.manifest.recipient.email,
    issuedAt: publishedAt,
    ttlSeconds: input.ttlDays * 24 * 60 * 60,
    jti: deterministicJti(input.manifest),
  });

  return `${origin}/e/${signEvidenceToken(claims, secret)}`;
};

/** When the links stop working, as a date. */
export const expiryDate = (manifest: ReportManifest, ttlDays: number): Date =>
  new Date(Date.parse(manifest.publishedAt) + ttlDays * 24 * 60 * 60 * 1000);

/**
 * Expiry runs from `publishedAt`, not from the moment of generation — that is
 * what makes a rebuild produce identical bytes. The cost is that building from
 * an old manifest mints links that are already dead, and a PDF of dead links
 * is indistinguishable from a PDF of live ones until a client clicks one.
 *
 * So both generators say so, loudly, at the last moment anyone can still act on
 * it. Returns the sentence to print, or `undefined` when the links are live.
 */
export const staleExpiryWarning = (expires: Date, now: Date = new Date()): string | undefined =>
  expires.getTime() > now.getTime()
    ? undefined
    : `WARNING: these links expired on ${expires.toISOString().slice(0, 10)} and will be refused.\n` +
      `  Expiry runs from the manifest's publishedAt, not from now.\n` +
      `  Raise --ttl-days, or republish the manifest with a current publishedAt.\n`;

/**
 * Deterministic document id: the same inputs always produce the same bytes.
 * Reproducible artifacts are what make "this is the version we published" a
 * checkable statement rather than a promise.
 *
 * The separator is a NUL byte — it cannot appear in a URL, so no
 * manifest-and-URL pair can collide with another by shifting where one ends
 * and the next begins. It is written as `\u0000` rather than as a literal
 * control character: an invisible byte in a source file reads as a space and
 * gets silently "corrected" by the next person to touch the line, which
 * changes the id of every artifact ever published.
 */
export const documentIdFor = (manifestJson: string, baseUrl: string): string =>
  createHash('sha256')
    .update(manifestJson)
    .update('\u0000')
    .update(baseUrl)
    .digest('hex')
    .slice(0, 32);
