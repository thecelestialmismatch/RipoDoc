import { readFile } from 'node:fs/promises';
import { verifyAuditLog, type VerifyAuditResult } from './audit-log.ts';
import { listPublishedManifests } from './store.ts';

export interface AuditLogStatus {
  readonly mode: 'file' | 'stdout';
  readonly configured: boolean;
  readonly verification?: VerifyAuditResult;
  readonly message: string;
}

export interface SecurityPosture {
  readonly evidenceSecretConfigured: boolean;
  readonly revokedTokenCount: number;
  readonly exportsEnabled: boolean;
  readonly publishedReportCount: number;
  readonly auditLog: AuditLogStatus;
}

const configuredRevocationCount = (): number =>
  (process.env.RIPODOC_REVOKED_JTIS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean).length;

const auditLogStatus = async (): Promise<AuditLogStatus> => {
  const path = process.env.RIPODOC_AUDIT_LOG;
  if (!path) {
    return {
      mode: 'stdout',
      configured: false,
      message:
        'Access events are emitted as structured stdout logs. Set RIPODOC_AUDIT_LOG on a persistent runtime to enable a locally verifiable append-only chain.',
    };
  }

  try {
    const verification = verifyAuditLog(await readFile(path, 'utf8'));
    return {
      mode: 'file',
      configured: true,
      verification,
      message: verification.ok
        ? `Verified ${verification.records} hash-chained audit record${verification.records === 1 ? '' : 's'}.`
        : `Audit integrity check failed at record ${verification.failedAt}: ${verification.reason}.`,
    };
  } catch {
    return {
      mode: 'file',
      configured: true,
      message: 'A file audit log is configured but could not be read by this runtime.',
    };
  }
};

/**
 * Return operator-safe status indicators for the security page and admin view.
 * No signing secret, token id, recipient email, or audit record is returned.
 */
export const getSecurityPosture = async (): Promise<SecurityPosture> => {
  const [reports, auditLog] = await Promise.all([listPublishedManifests(), auditLogStatus()]);

  return {
    evidenceSecretConfigured: (process.env.RIPODOC_EVIDENCE_SECRET?.length ?? 0) >= 32,
    revokedTokenCount: configuredRevocationCount(),
    exportsEnabled: (process.env.RIPODOC_ALLOW_EXPORT ?? 'true').toLowerCase() !== 'false',
    publishedReportCount: reports.length,
    auditLog,
  };
};
