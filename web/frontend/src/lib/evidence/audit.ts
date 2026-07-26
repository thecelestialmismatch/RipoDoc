/**
 * Access audit trail.
 *
 * "This is what was published, this is who opened it, this is when" is the
 * claim RipoDoc sells. It only holds if every access is recorded before the
 * data is rendered — so `recordAccess` is awaited on the request path, not
 * fired and forgotten.
 *
 * The default sink is structured stdout, which every hosting platform ships to
 * a log store. A durable sink (Postgres) replaces `sink` without touching call
 * sites.
 */

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

let sink: AuditSink = stdoutSink;

/** Swap the sink (tests, or a durable store in production). */
export const setAuditSink = (next: AuditSink): void => {
  sink = next;
};

export const recordAccess = async (
  event: Omit<AccessEvent, 'at'> & { readonly at?: string },
): Promise<void> => {
  await sink.write({ ...event, at: event.at ?? new Date().toISOString() });
};
