-- Production authentication, session, rate-limit, and tenant-scoped workspace state.
-- Apply this migration to the PostgreSQL instance identified by RIPODOC_DATABASE_URL.

CREATE TABLE IF NOT EXISTS auth_users (
    id UUID PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'author', 'viewer')),
    password_hash TEXT NOT NULL,
    email_verified_at TIMESTAMPTZ,
    disabled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, email)
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_users_unique_email_ci
    ON auth_users (LOWER(email));

CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    ip_hash TEXT,
    user_agent_hash TEXT
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_active_idx
    ON auth_sessions (user_id, expires_at)
    WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS auth_one_time_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL CHECK (purpose IN ('verify-email', 'reset-password')),
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS auth_one_time_tokens_active_idx
    ON auth_one_time_tokens (user_id, purpose, expires_at)
    WHERE used_at IS NULL;

CREATE TABLE IF NOT EXISTS auth_rate_limits (
    bucket TEXT PRIMARY KEY,
    count INTEGER NOT NULL CHECK (count >= 0),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_audit_events (
    id UUID PRIMARY KEY,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    tenant_id TEXT REFERENCES tenants(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    outcome TEXT NOT NULL,
    ip_hash TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS auth_audit_events_user_at_idx
    ON auth_audit_events (user_id, at DESC);

CREATE TABLE IF NOT EXISTS workspace_reports (
    report_id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    manifest JSONB NOT NULL,
    created_by UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workspace_reports_tenant_published_idx
    ON workspace_reports (tenant_id, published_at DESC);

-- Database roles should receive least-privilege grants. The web role must not
-- own migrations and must not have unqualified access to other tenant data.

CREATE TABLE IF NOT EXISTS evidence_recipient_challenges (
    id UUID PRIMARY KEY,
    evidence_token_hash TEXT NOT NULL,
    recipient_hash TEXT NOT NULL,
    code_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS evidence_recipient_challenges_active_idx
    ON evidence_recipient_challenges (evidence_token_hash, expires_at)
    WHERE used_at IS NULL;
