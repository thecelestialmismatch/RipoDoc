-- Share links table (recipient-bound, expiring, revocable)
CREATE TABLE IF NOT EXISTS share_links (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    version INT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_hash TEXT NOT NULL,
    token TEXT NOT NULL,
    ttl_days INT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    download_ok BOOLEAN NOT NULL DEFAULT false,
    export_ok BOOLEAN NOT NULL DEFAULT false,
    watermark BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_links_report_id ON share_links(report_id);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);