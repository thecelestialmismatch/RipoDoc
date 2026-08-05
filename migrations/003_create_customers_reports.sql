-- Customers table (MSP's clients)
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON customers(tenant_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    customer_id TEXT NOT NULL REFERENCES customers(id),
    title TEXT NOT NULL,
    period_label TEXT NOT NULL,
    provider TEXT NOT NULL,
    client TEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft',
    manifest JSONB,
    published_at TIMESTAMPTZ,
    published_by TEXT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_tenant_customer ON reports(tenant_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Report elements (review queue items)
CREATE TABLE IF NOT EXISTS report_elements (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    label TEXT NOT NULL,
    value TEXT,
    confidence FLOAT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    approved_by TEXT REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    source_rows JSONB,
    page INT,
    rect JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_elements_report_id ON report_elements(report_id);