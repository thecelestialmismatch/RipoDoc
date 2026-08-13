import { readFile } from 'node:fs/promises';
import { authConfigured, databaseConfigured } from '../auth/database-status.ts';
import { verifyAuditLog, type VerifyAuditResult } from './audit-log.ts';
import { postgresAuditConfigured } from './audit-postgres.ts';
import { leadIntakeConfigured } from '../founder/lead-crypto.ts';
import { listPublishedManifests } from './store.ts';

export interface AuditLogStatus {
  readonly mode: 'file' | 'postgres' | 'stdout';
  readonly configured: boolean;
  readonly verification?: VerifyAuditResult;
  readonly message: string;
}

export interface HostedReadiness {
  readonly databaseConfigured: boolean;
  readonly authenticationConfigured: boolean;
  readonly canonicalOriginConfigured: boolean;
  readonly emailConfigured: boolean;
  readonly captchaConfigured: boolean;
  readonly durableAuditConfigured: boolean;
  readonly privateWorkerConfigured: boolean;
  readonly foundingPartnerIntakeConfigured: boolean;
}

export interface SecurityPosture {
  readonly evidenceSecretConfigured: boolean;
  readonly revokedTokenCount: number;
  readonly exportsEnabled: boolean;
  readonly publishedReportCount: number;
  readonly auditLog: AuditLogStatus;
  readonly hostedReadiness: HostedReadiness;
}

const configuredRevocationCount = (): number =>
  (process.env.RIPODOC_REVOKED_JTIS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean).length;

const configuredOrigin = (): boolean => {
  const value = process.env.RIPODOC_APP_ORIGIN;
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
};

const emailConfigured = (): boolean => Boolean(process.env.RIPODOC_RESEND_API_KEY && process.env.RIPODOC_EMAIL_FROM);

const captchaConfigured = (): boolean =>
  process.env.NODE_ENV !== 'production' || Boolean(process.env.RIPODOC_TURNSTILE_SECRET && process.env.NEXT_PUBLIC_RIPODOC_TURNSTILE_SITE_KEY);

const privateWorkerConfigured = (): boolean => {
  const url = process.env.RIPODOC_LOCAL_WORKER_URL;
  const secret = process.env.RIPODOC_WORKER_AUTH_SECRET;
  if (!url || !secret || secret.length < 32) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const auditLogStatus = async (): Promise<AuditLogStatus> => {
  if (postgresAuditConfigured()) {
    return {
      mode: 'postgres',
      configured: databaseConfigured(),
      message: databaseConfigured()
        ? 'PostgreSQL hash-chained evidence audit storage is selected. Run the authenticated production preflight to verify schema reachability.'
        : 'PostgreSQL audit storage is selected but RIPODOC_DATABASE_URL is unavailable.',
    };
  }

  const path = process.env.RIPODOC_AUDIT_LOG;
  if (!path) {
    return {
      mode: 'stdout',
      configured: false,
      message:
        'Access events are emitted as structured stdout logs. Configure PostgreSQL audit storage for hosted deployments or RIPODOC_AUDIT_LOG on a persistent self-hosted runtime.',
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
 * Return operator-safe status indicators for the security page and health view.
 * No signing secret, token id, recipient identity, report id, audit record, or
 * environment value is returned.
 */
export const getSecurityPosture = async (): Promise<SecurityPosture> => {
  const [reports, auditLog] = await Promise.all([listPublishedManifests(), auditLogStatus()]);
  const origin = configuredOrigin();
  const email = emailConfigured();
  const captcha = captchaConfigured();
  const database = databaseConfigured();

  return {
    evidenceSecretConfigured: (process.env.RIPODOC_EVIDENCE_SECRET?.length ?? 0) >= 32,
    revokedTokenCount: configuredRevocationCount(),
    exportsEnabled: (process.env.RIPODOC_ALLOW_EXPORT ?? 'true').toLowerCase() !== 'false',
    publishedReportCount: reports.length,
    auditLog,
    hostedReadiness: {
      databaseConfigured: database,
      authenticationConfigured: authConfigured(),
      canonicalOriginConfigured: origin,
      emailConfigured: email,
      captchaConfigured: captcha,
      durableAuditConfigured: auditLog.configured && auditLog.mode !== 'stdout',
      privateWorkerConfigured: privateWorkerConfigured(),
      foundingPartnerIntakeConfigured: leadIntakeConfigured(),
    },
  };
};
