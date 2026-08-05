-- Audit events table (append-only, hash-chained)
CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    actor_id TEXT,
    subject_id TEXT,
    payload JSONB NOT NULL,
    prev_hash TEXT NOT NULL,
    hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_created ON audit_events(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_events_hash ON audit_events(hash);

-- Prevent UPDATE/DELETE to enforce append-only semantics
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;