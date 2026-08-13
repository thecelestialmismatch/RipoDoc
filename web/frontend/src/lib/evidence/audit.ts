/**
 * Access audit trail.
 *
 * “Every access is logged” only holds if the access event is persisted before
 * the evidence rows render. `recordAccess` is therefore awaited on the request
 * path. The runtime supports three explicit modes:
 *
 * - stdout: development / unconfigured fallback only;
 * - file: self-hosted locally verifiable JSONL chain;
 * - postgres: durable hosted chain, transactional and serialized by a locked
 *   head row. PostgreSQL is written before structured stdout.
 */

import { createFileAuditSink, teeAuditSinks } from './audit-log.ts';
import { createPostgresAuditSink, postgresAuditConfigured } from './audit-postgres.ts';

export type AuditOutcome = 'granted' | 'denied';

export interface AccessEvent {
  readonly at: string;
  readonly outcome: AuditOutcome;
  readonly reportId?: string;
  readonly version?: number;
  readonly elementId?: string;
  /** Token id, so a specific link can be traced and revoked. */
  readonly jti?: string;
  /** Hashed recipient — never the raw address. */
  readonly recipientHash?: string;
  readonly reason?: string;
}

export interface AuditSink {
  write(event: AccessEvent): Promise<void>;
}

const stdoutSink: AuditSink = {
  async write(event) {
    process.stdout.write(`${JSON.stringify({ type: 'evidence.access', ...event })}\n`);
  },
};

let override: AuditSink | undefined;
let configured: AuditSink | undefined;

const activeSink = (): AuditSink => {
  if (override) return override;
  if (!configured) {
    const path = process.env.RIPODOC_AUDIT_LOG;
    configured = postgresAuditConfigured()
      ? teeAuditSinks(createPostgresAuditSink(), stdoutSink)
      : path
        ? teeAuditSinks(createFileAuditSink(path), stdoutSink)
        : stdoutSink;
  }
  return configured;
};

/** Swap the sink for tests or a deliberately supplied durable store. */
export const setAuditSink = (next: AuditSink): void => {
  override = next;
};

/** Drop an override and re-read deployment configuration on the next write. */
export const resetAuditSink = (): void => {
  override = undefined;
  configured = undefined;
};

export const recordAccess = async (
  event: Omit<AccessEvent, 'at'> & { readonly at?: string },
): Promise<void> => {
  await activeSink().write({ ...event, at: event.at ?? new Date().toISOString() });
};
