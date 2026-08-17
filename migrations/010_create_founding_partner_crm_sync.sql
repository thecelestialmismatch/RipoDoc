-- Optional EspoCRM synchronization for consented RipoDoc founding-partner leads.
-- This is intentionally separate from evidence access, report, tenant, recipient,
-- token, and audit-chain storage. Apply only to RIPODOC_DATABASE_URL.

ALTER TABLE founding_partner_leads
    ADD COLUMN IF NOT EXISTS crm_sync_consent BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS founding_partner_crm_syncs (
    lead_id UUID PRIMARY KEY REFERENCES founding_partner_leads(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'espocrm' CHECK (provider = 'espocrm'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'synced', 'failed')),
    remote_lead_id TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    last_attempt_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ,
    failure_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS founding_partner_crm_syncs_status_idx
    ON founding_partner_crm_syncs (status, updated_at ASC);

-- The runtime application role should have only the INSERT/SELECT/UPDATE grants
-- necessary to create and process this outbox. It must not receive access to
-- evidence_access_audit_records, token secrets, or the EspoCRM database.
