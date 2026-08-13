import { randomUUID } from 'node:crypto';
import { query } from '../auth/database.ts';

export type FounderEventType =
  | 'workspace_verified'
  | 'report_started'
  | 'report_reviewed'
  | 'report_published'
  | 'evidence_opened'
  | 'recipient_proof_completed'
  | 'report_cycle_completed'
  | 'partner_outcome_recorded'
  | 'integration_requested';

type Scalar = string | number | boolean;
type SafeMetadata = Readonly<Record<string, Scalar>>;

const allowedMetadata: Readonly<Record<FounderEventType, ReadonlySet<string>>> = {
  workspace_verified: new Set(['activation_source']),
  report_started: new Set(['mode', 'source_system_band']),
  report_reviewed: new Set(['outcome', 'mode', 'review_round_band']),
  report_published: new Set(['mode', 'report_type_band']),
  evidence_opened: new Set(['result', 'element_type_band']),
  recipient_proof_completed: new Set(['result']),
  report_cycle_completed: new Set(['cycle_number', 'report_type_band', 'outcome_band']),
  partner_outcome_recorded: new Set(['time_saved_band', 'continue_intent', 'budget_path_band', 'integration_request_band']),
  integration_requested: new Set(['source_system_band', 'workflow_stage']),
};

const safeMetadata = (eventType: FounderEventType, metadata: SafeMetadata = {}): Record<string, Scalar> => {
  const allowed = allowedMetadata[eventType];
  const entries = Object.entries(metadata).filter(([key, value]) => {
    if (!allowed.has(key)) return false;
    if (typeof value === 'string') return value.length <= 48 && /^[a-z0-9_-]+$/i.test(value);
    return typeof value === 'number' ? Number.isFinite(value) : true;
  });
  return Object.fromEntries(entries);
};

/**
 * Best-effort product-learning telemetry. It cannot expose customer content and
 * never changes the outcome of an identity, evidence, or report operation.
 * The production preflight enforces the migration before hosted activation.
 */
export const recordFounderEvent = async (input: {
  readonly tenantId?: string;
  readonly eventType: FounderEventType;
  readonly metadata?: SafeMetadata;
}): Promise<void> => {
  try {
    await query(
      `INSERT INTO founding_partner_events (id, tenant_id, event_type, metadata)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [randomUUID(), input.tenantId ?? null, input.eventType, JSON.stringify(safeMetadata(input.eventType, input.metadata))],
    );
  } catch {
    // The product operation must remain correct when noncritical analytics
    // storage is unavailable. Production preflight detects a missing schema.
  }
};
