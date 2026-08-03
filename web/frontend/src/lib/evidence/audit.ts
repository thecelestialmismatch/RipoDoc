/**
 * Access audit trail.
 *
 * "This is what was published, this is who opened it, this is when" is the
 * claim RipoDoc sells. It only holds if every access is recorded before the
 * data is rendered — so `recordAccess` is awaited on the request path, not
 * fired and forgotten.
 *
 * Two sinks ship. Structured stdout is always on, because every hosting
 * platform forwards it to a log store. When `RIPODOC_AUDIT_LOG` names a file,
 * a hash-chained append-only log is written as well (`audit-log.ts`) — that is
 * the copy an MSP can hand to an assessor, because altering it is detectable.
 * A Postgres sink replaces either without touching call sites.
 */

import { createFileAuditSink, teeAuditSinks } from './audit-log.ts';

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
    configured = path ? teeAuditSinks(createFileAuditSink(path), stdoutSink) : stdoutSink;
  }
  return configured;
};

/** Swap the sink (tests, or a durable store in production). */
export const setAuditSink = (next: AuditSink): void => {
  override = next;
};

/** Drop an override and re-read the environment on the next write. */
export const resetAuditSink = (): void => {
  override = undefined;
  configured = undefined;
};

export const recordAccess = async (
  event: Omit<AccessEvent, 'at'> & { readonly at?: string },
): Promise<void> => {
  await activeSink().write({ ...event, at: event.at ?? new Date().toISOString() });
};
