-- River job queue schema
CREATE TABLE IF NOT EXISTS river_job (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    priority INT NOT NULL DEFAULT 0,
    state TEXT NOT NULL,
    attempted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_river_job_kind ON river_job(kind);
CREATE INDEX IF NOT EXISTS idx_river_job_state ON river_job(state);