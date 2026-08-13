-- Durable evidence-access and founder-learning records.
-- Apply only to the PostgreSQL runtime identified by RIPODOC_DATABASE_URL.
-- The web runtime uses parameterized statements and must receive least-privilege
-- INSERT/SELECT grants only; the migration role owns this schema change.

CREATE TABLE IF NOT EXISTS evidence_access_audit_head (
    chain_key TEXT PRIMARY KEY,
    seq BIGINT NOT NULL CHECK (seq >= 0),
    hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence_access_audit_records (
    chain_key TEXT NOT NULL REFERENCES evidence_access_audit_head(chain_key) ON DELETE RESTRICT,
    seq BIGINT NOT NULL CHECK (seq > 0),
    at TIMESTAMPTZ NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('granted', 'denied')),
    report_id TEXT,
    version INTEGER,
    element_id TEXT,
    jti TEXT,
    recipient_hash TEXT,
    reason TEXT,
    prev_hash TEXT NOT NULL,
    hash TEXT NOT NULL,
    PRIMARY KEY (chain_key, seq),
    UNIQUE (chain_key, hash)
);

CREATE INDEX IF NOT EXISTS evidence_access_audit_records_at_idx
    ON evidence_access_audit_records (at DESC);
CREATE INDEX IF NOT EXISTS evidence_access_audit_records_report_idx
    ON evidence_access_audit_records (report_id, at DESC);

-- Partner and funnel records intentionally store only program metadata. No report
-- content, raw recipients, authentication credentials, tokens, payment-card data,
-- or customer source rows belong in these tables.
CREATE TABLE IF NOT EXISTS founding_partner_leads (
    id UUID PRIMARY KEY,
    email_hash TEXT NOT NULL UNIQUE,
    contact_email_ciphertext TEXT NOT NULL,
    contact_email_iv TEXT NOT NULL,
    contact_email_tag TEXT NOT NULL,
    contact_email_key_id TEXT NOT NULL DEFAULT 'v1',
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    company_size_band TEXT NOT NULL CHECK (company_size_band IN ('1-19', '20-49', '50-149', '150-plus', 'not-sure')),
    reporting_tool_band TEXT NOT NULL CHECK (reporting_tool_band IN ('manual', 'bi', 'msp-reporting', 'portal', 'mixed', 'other')),
    interest_mode TEXT NOT NULL CHECK (interest_mode IN ('hosted', 'self-hosted', 'not-sure')),
    source TEXT NOT NULL CHECK (source IN ('website', 'direct', 'referral', 'event', 'other')),
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'qualified', 'declined', 'committed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS founding_partner_leads_status_created_idx
    ON founding_partner_leads (status, created_at DESC);

CREATE TABLE IF NOT EXISTS founding_partner_events (
    id UUID PRIMARY KEY,
    lead_id UUID REFERENCES founding_partner_leads(id) ON DELETE SET NULL,
    tenant_id TEXT REFERENCES tenants(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'lead_submitted', 'lead_qualified', 'design_partner_committed',
        'workspace_verified', 'report_started', 'report_reviewed',
        'report_published', 'evidence_opened', 'recipient_proof_completed',
        'report_cycle_completed', 'partner_outcome_recorded', 'integration_requested'
    )),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS founding_partner_events_tenant_created_idx
    ON founding_partner_events (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS founding_partner_events_type_created_idx
    ON founding_partner_events (event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS founding_partner_outcomes (
    id UUID PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES founding_partner_leads(id) ON DELETE CASCADE,
    cycle_number INTEGER NOT NULL CHECK (cycle_number BETWEEN 1 AND 12),
    report_type_band TEXT NOT NULL CHECK (report_type_band IN ('qbr', 'monthly', 'security', 'operational', 'other')),
    baseline_minutes INTEGER CHECK (baseline_minutes BETWEEN 0 AND 10080),
    after_minutes INTEGER CHECK (after_minutes BETWEEN 0 AND 10080),
    continue_intent TEXT NOT NULL CHECK (continue_intent IN ('yes', 'no', 'undecided')),
    budget_path_band TEXT NOT NULL CHECK (budget_path_band IN ('additive', 'displacement', 'unknown')),
    integration_request_band TEXT NOT NULL DEFAULT 'none' CHECK (integration_request_band IN ('none', 'connectwise', 'halopsa', 'other')),
    consented_at TIMESTAMPTZ NOT NULL,
    recorded_by UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (lead_id, cycle_number, report_type_band)
);

CREATE INDEX IF NOT EXISTS founding_partner_outcomes_lead_cycle_idx
    ON founding_partner_outcomes (lead_id, cycle_number);

-- Database administrators should enforce append-only policy at the role/grant
-- layer: application roles receive no UPDATE or DELETE privilege on audit records.
