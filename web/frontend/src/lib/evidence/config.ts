/**
 * Server configuration for evidence links.
 *
 * Fails loudly at first use rather than defaulting to a built-in secret: a
 * fallback signing key would silently make every evidence link forgeable.
 */

export const evidenceSecret = (): string => {
  const secret = process.env.RIPODOC_EVIDENCE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'RIPODOC_EVIDENCE_SECRET must be set to at least 32 characters. ' +
        'Evidence links cannot be verified without it.',
    );
  }
  return secret;
};

/**
 * Revoked token ids — the instant kill switch. Comma-separated in
 * `RIPODOC_REVOKED_JTIS`; a database-backed list replaces this later.
 */
export const revokedTokenIds = (): ReadonlySet<string> =>
  new Set(
    (process.env.RIPODOC_REVOKED_JTIS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  );

/** Whether recipients may export rows. Defaults to allowed. */
export const exportsEnabled = (): boolean =>
  (process.env.RIPODOC_ALLOW_EXPORT ?? 'true').toLowerCase() !== 'false';
