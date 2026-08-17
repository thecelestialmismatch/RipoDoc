import { query, transaction } from '../auth/database.ts';
import { GENESIS, chainRecord } from './audit-log.ts';
import type { AccessEvent, AuditSink } from './audit.ts';
import type { ReportAuditSummary } from './operations.ts';

const CHAIN_KEY = 'evidence-access-v1';

/**
 * PostgreSQL-backed evidence-access chain.
 *
 * The chain head is locked inside the transaction before the next record is
 * calculated, so concurrent evidence requests cannot create a fork. The web
 * runtime inserts only; the database role should not hold UPDATE or DELETE
 * privilege over historical records.
 */
export const createPostgresAuditSink = (): AuditSink => ({
  async write(event: AccessEvent): Promise<void> {
    await transaction(async (client) => {
      await client.query(
        `INSERT INTO evidence_access_audit_head (chain_key, seq, hash)
         VALUES ($1, 0, $2)
         ON CONFLICT (chain_key) DO NOTHING`,
        [CHAIN_KEY, GENESIS],
      );

      const result = await client.query<{ seq: string; hash: string }>(
        `SELECT seq, hash
         FROM evidence_access_audit_head
         WHERE chain_key = $1
         FOR UPDATE`,
        [CHAIN_KEY],
      );
      const previous = result.rows[0];
      if (!previous) throw new Error('Evidence audit head could not be initialized.');

      const record = chainRecord(event, {
        seq: Number(previous.seq),
        hash: previous.hash,
      });

      await client.query(
        `INSERT INTO evidence_access_audit_records (
          chain_key, seq, at, outcome, report_id, version, element_id, jti,
          recipient_hash, reason, prev_hash, hash
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          CHAIN_KEY,
          record.seq,
          record.at,
          record.outcome,
          record.reportId ?? null,
          record.version ?? null,
          record.elementId ?? null,
          record.jti ?? null,
          record.recipientHash ?? null,
          record.reason ?? null,
          record.prev,
          record.hash,
        ],
      );

      await client.query(
        `UPDATE evidence_access_audit_head
         SET seq = $2, hash = $3, updated_at = NOW()
         WHERE chain_key = $1`,
        [CHAIN_KEY, record.seq, record.hash],
      );
    });
  },
});

export const postgresAuditConfigured = (): boolean =>
  process.env.RIPODOC_AUDIT_BACKEND?.toLowerCase() === 'postgres';

interface AuditSummaryRow {
  readonly report_id: string;
  readonly granted: string;
  readonly denied: string;
  readonly last_granted_at: string | null;
  readonly last_event_at: string | null;
}

/**
 * Summarise only report ids that have already been tenant-authorised by the
 * workspace layer. The audit table deliberately stores recipient hashes only;
 * this query never returns raw email addresses, tokens, evidence rows, or
 * client-report content.
 */
export const loadPostgresAuditSummaries = async (
  reportIds: readonly string[],
): Promise<ReadonlyMap<string, ReportAuditSummary>> => {
  const empty = new Map<string, ReportAuditSummary>();
  if (!postgresAuditConfigured() || reportIds.length === 0) return empty;

  try {
    const rows = await query<AuditSummaryRow>(
      `SELECT report_id,
              COUNT(*) FILTER (WHERE outcome = 'granted')::text AS granted,
              COUNT(*) FILTER (WHERE outcome = 'denied')::text AS denied,
              MAX(at) FILTER (WHERE outcome = 'granted') AS last_granted_at,
              MAX(at) AS last_event_at
       FROM evidence_access_audit_records
       WHERE report_id = ANY($1::text[])
       GROUP BY report_id`,
      [reportIds],
    );
    for (const row of rows) {
      empty.set(row.report_id, {
        status: 'durable',
        granted: Number(row.granted),
        denied: Number(row.denied),
        ...(row.last_granted_at ? { lastGrantedAt: row.last_granted_at } : {}),
        ...(row.last_event_at ? { lastEventAt: row.last_event_at } : {}),
      });
    }
  } catch {
    // Dashboard analytics are supplemental. A read issue must not weaken the
    // evidence-delivery path or expose database internals to the operator.
    return new Map<string, ReportAuditSummary>();
  }
  return empty;
};
