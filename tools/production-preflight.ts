import { database } from '../web/frontend/src/lib/auth/database.ts';
import { authConfigured } from '../web/frontend/src/lib/auth/primitives.ts';

type Check = {
  readonly name: string;
  readonly ok: boolean;
  readonly detail: string;
};

const checks: Check[] = [];
const add = (name: string, ok: boolean, detail: string): void => { checks.push({ name, ok, detail }); };

const validHttpsOrigin = (): boolean => {
  const value = process.env.RIPODOC_APP_ORIGIN;
  if (!value) return false;
  try {
    const origin = new URL(value);
    return origin.protocol === 'https:' && !origin.username && !origin.password;
  } catch {
    return false;
  }
};

const configuredWorker = (): string | undefined => {
  const url = process.env.RIPODOC_LOCAL_WORKER_URL;
  const secret = process.env.RIPODOC_WORKER_AUTH_SECRET;
  if (!url || !secret || secret.length < 32) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString().replace(/\/$/, '') : undefined;
  } catch {
    return undefined;
  }
};

const run = async (): Promise<void> => {
  add('authentication configuration', authConfigured(), 'Database, authentication secret, canonical origin, email, and production CAPTCHA values are configured.');
  add('canonical HTTPS origin', validHttpsOrigin(), 'RIPODOC_APP_ORIGIN parses as a credential-free HTTPS origin.');
  add('evidence signing secret', (process.env.RIPODOC_EVIDENCE_SECRET?.length ?? 0) >= 32, 'RIPODOC_EVIDENCE_SECRET has the required minimum length.');
  add('durable PostgreSQL audit selection', process.env.RIPODOC_AUDIT_BACKEND?.toLowerCase() === 'postgres', 'RIPODOC_AUDIT_BACKEND is explicitly set to postgres.');

  const worker = configuredWorker();
  add('private worker configuration', Boolean(worker), 'RIPODOC_LOCAL_WORKER_URL and a 32+ character server-only worker secret are configured.');

  if (process.env.RIPODOC_DATABASE_URL) {
    try {
      const pool = database();
      await pool.query('SELECT 1');
      const expected = [
        'auth_users',
        'auth_sessions',
        'workspace_reports',
        'auth_audit_events',
        'evidence_access_audit_head',
        'evidence_access_audit_records',
        'founding_partner_leads',
        'founding_partner_events',
        'founding_partner_outcomes',
      ];
      const result = await pool.query<{ table_name: string }>(
        `SELECT table_name
         FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
        [expected],
      );
      const existing = new Set(result.rows.map((row) => row.table_name));
      const missing = expected.filter((name) => !existing.has(name));
      add('database connectivity and migration revision', missing.length === 0, missing.length === 0 ? 'PostgreSQL is reachable and required durable-auth, audit, and founder-evidence tables exist.' : `Missing migration tables: ${missing.join(', ')}.`);
      await pool.end();
    } catch {
      add('database connectivity and migration revision', false, 'PostgreSQL could not be reached or the required schema could not be inspected.');
    }
  } else {
    add('database connectivity and migration revision', false, 'RIPODOC_DATABASE_URL is unavailable.');
  }

  if (worker) {
    try {
      const response = await fetch(`${worker}/health`, { signal: AbortSignal.timeout(5_000) });
      add('private worker reachability', response.ok, 'Trusted server-to-worker health endpoint responded without issuing an authoring request.');
    } catch {
      add('private worker reachability', false, 'Trusted server could not reach the configured worker health endpoint.');
    }
  } else {
    add('private worker reachability', false, 'Worker URL or worker secret is not configured.');
  }

  const report = {
    status: checks.every((check) => check.ok) ? 'ready' : 'not-ready',
    checks,
  };
  process.stdout.write(`${JSON.stringify(report)}\n`);
  if (report.status !== 'ready') process.exitCode = 1;
};

void run();
