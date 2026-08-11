import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { sendPasswordResetEmail, sendVerificationEmail } from './email.ts';
import { query, transaction } from './database.ts';
import { delayToFloor, genericAuthMessage, hashPassword, isEmail, normalizeEmail, privacyHash, randomToken, tokenHash, validatePassword, verifyPassword } from './primitives.ts';

export type AuthRole = 'owner' | 'admin' | 'author' | 'viewer';

export interface AuthUser {
  readonly id: string;
  readonly tenantId: string;
  readonly email: string;
  readonly name: string;
  readonly role: AuthRole;
  readonly emailVerifiedAt: string | null;
  readonly disabledAt: string | null;
}

interface UserRow extends AuthUser { readonly passwordHash: string; }
interface SessionRow { readonly userId: string; readonly tenantId: string; readonly email: string; readonly name: string; readonly role: AuthRole; readonly emailVerifiedAt: string | null; readonly disabledAt: string | null; }

const DUMMY_PASSWORD_HASH = 'scrypt$32768$8$1$MDEyMzQ1Njc4OWFiY2RlZg$wLfLnwKAESRGsr7h1pHcuRKMklbr0ZLqJ3D2YJ0EcRKG_U-Txm2Clal6ewII-ckTR-VMQm_dTCKUd89Jre3ZJw';
const TOKEN_TTL_MINUTES = 30;
const SESSION_HOURS = 8;

const userSelect = `SELECT id, tenant_id AS "tenantId", email, name, role, password_hash AS "passwordHash", email_verified_at AS "emailVerifiedAt", disabled_at AS "disabledAt" FROM auth_users`;

const userFrom = (row: UserRow): AuthUser => ({ id: row.id, tenantId: row.tenantId, email: row.email, name: row.name, role: row.role, emailVerifiedAt: row.emailVerifiedAt, disabledAt: row.disabledAt });

const consumeRateLimit = async (bucket: string, limit: number, windowMinutes: number): Promise<boolean> => {
  const rows = await query<{ count: number }>(
    `INSERT INTO auth_rate_limits (bucket, count, expires_at)
     VALUES ($1, 1, NOW() + ($2::text || ' minutes')::interval)
     ON CONFLICT (bucket) DO UPDATE SET
       count = CASE WHEN auth_rate_limits.expires_at <= NOW() THEN 1 ELSE auth_rate_limits.count + 1 END,
       expires_at = CASE WHEN auth_rate_limits.expires_at <= NOW() THEN NOW() + ($2::text || ' minutes')::interval ELSE auth_rate_limits.expires_at END
     RETURNING count`,
    [bucket, windowMinutes],
  );
  return (rows[0]?.count ?? limit + 1) <= limit;
};

const audit = async (client: PoolClient, input: { userId?: string; tenantId?: string; event: string; outcome: 'granted' | 'denied'; ipHash?: string }): Promise<void> => {
  await client.query(
    `INSERT INTO auth_audit_events (id, user_id, tenant_id, event_type, outcome, ip_hash)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [randomUUID(), input.userId ?? null, input.tenantId ?? null, input.event, input.outcome, input.ipHash ?? null],
  );
};

const createOneTimeToken = async (client: PoolClient, userId: string, purpose: 'verify-email' | 'reset-password'): Promise<string> => {
  await client.query(`UPDATE auth_one_time_tokens SET used_at = NOW() WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL`, [userId, purpose]);
  const code = randomToken(32);
  await client.query(
    `INSERT INTO auth_one_time_tokens (id, user_id, purpose, token_hash, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '${TOKEN_TTL_MINUTES} minutes')`,
    [randomUUID(), userId, purpose, tokenHash(code)],
  );
  return code;
};

const findUserByEmail = async (email: string): Promise<UserRow | undefined> => (await query<UserRow>(`${userSelect} WHERE LOWER(email) = LOWER($1) LIMIT 1`, [email]))[0];

const rateLimitAuthRequest = async (action: string, email: string, ipHash: string): Promise<boolean> => {
  const [ipAllowed, accountAllowed] = await Promise.all([
    consumeRateLimit(`${action}:ip:${ipHash}`, 20, 15),
    consumeRateLimit(`${action}:email:${privacyHash(email)}`, 8, 15),
  ]);
  return ipAllowed && accountAllowed;
};

export const createAccount = async (input: { name: string; email: string; password: string; ip: string }): Promise<{ message: string }> => {
  const startedAt = Date.now();
  const email = normalizeEmail(input.email);
  const ipHash = privacyHash(input.ip);
  const accepted = isEmail(email) && input.name.trim().length >= 2 && !validatePassword(input.password) && await rateLimitAuthRequest('signup', email || 'invalid', ipHash);

  if (accepted) {
    const existing = await findUserByEmail(email);
    if (!existing) {
      const passwordHash = await hashPassword(input.password);
      const created = await transaction(async (client) => {
        const tenantId = `msp-${randomUUID()}`;
        const userId = randomUUID();
        await client.query(`INSERT INTO tenants (id, name, slug) VALUES ($1, $2, $3)`, [tenantId, `${input.name.trim()} workspace`, `workspace-${randomToken(8).toLowerCase()}`]);
        await client.query(`INSERT INTO auth_users (id, tenant_id, email, name, role, password_hash) VALUES ($1, $2, $3, $4, 'owner', $5)`, [userId, tenantId, email, input.name.trim().slice(0, 120), passwordHash]);
        const code = await createOneTimeToken(client, userId, 'verify-email');
        await audit(client, { userId, tenantId, event: 'signup', outcome: 'granted', ipHash });
        return { code };
      });
      await sendVerificationEmail(email, created.code).catch(() => undefined);
    } else if (!existing.emailVerifiedAt && !existing.disabledAt) {
      const code = await transaction(async (client) => {
        const result = await createOneTimeToken(client, existing.id, 'verify-email');
        await audit(client, { userId: existing.id, tenantId: existing.tenantId, event: 'signup-repeat', outcome: 'denied', ipHash });
        return result;
      });
      await sendVerificationEmail(email, code).catch(() => undefined);
    }
  }
  await delayToFloor(startedAt);
  return { message: genericAuthMessage };
};

export const requestPasswordReset = async (input: { email: string; ip: string }): Promise<{ message: string }> => {
  const startedAt = Date.now();
  const email = normalizeEmail(input.email);
  const ipHash = privacyHash(input.ip);
  const accepted = isEmail(email) && await rateLimitAuthRequest('reset-request', email || 'invalid', ipHash);
  if (accepted) {
    const user = await findUserByEmail(email);
    if (user?.emailVerifiedAt && !user.disabledAt) {
      const code = await transaction(async (client) => {
        const result = await createOneTimeToken(client, user.id, 'reset-password');
        await audit(client, { userId: user.id, tenantId: user.tenantId, event: 'password-reset-request', outcome: 'granted', ipHash });
        return result;
      });
      await sendPasswordResetEmail(user.email, code).catch(() => undefined);
    }
  }
  await delayToFloor(startedAt);
  return { message: genericAuthMessage };
};

const consumeCode = async (purpose: 'verify-email' | 'reset-password', code: string): Promise<AuthUser | undefined> => transaction(async (client) => {
  const token = await client.query<UserRow & { tokenId: string }>(
    `${userSelect} JOIN auth_one_time_tokens ON auth_one_time_tokens.user_id = auth_users.id
     WHERE auth_one_time_tokens.purpose = $1 AND auth_one_time_tokens.token_hash = $2 AND auth_one_time_tokens.used_at IS NULL AND auth_one_time_tokens.expires_at > NOW()
     FOR UPDATE`,
    [purpose, tokenHash(code)],
  );
  const row = token.rows[0];
  if (!row) return undefined;
  await client.query(`UPDATE auth_one_time_tokens SET used_at = NOW() WHERE token_hash = $1`, [tokenHash(code)]);
  if (purpose === 'verify-email') await client.query(`UPDATE auth_users SET email_verified_at = COALESCE(email_verified_at, NOW()), updated_at = NOW() WHERE id = $1`, [row.id]);
  return { ...userFrom(row), emailVerifiedAt: purpose === 'verify-email' ? new Date().toISOString() : row.emailVerifiedAt };
});

export const verifyEmailCode = async (code: string, ip: string): Promise<boolean> => {
  const user = await consumeCode('verify-email', code);
  if (user) await transaction((client) => audit(client, { userId: user.id, tenantId: user.tenantId, event: 'email-verification', outcome: 'granted', ipHash: privacyHash(ip) }));
  return Boolean(user);
};

export const resetPasswordWithCode = async (input: { code: string; password: string; ip: string }): Promise<boolean> => {
  if (validatePassword(input.password)) return false;
  const user = await consumeCode('reset-password', input.code);
  if (!user) return false;
  const passwordHash = await hashPassword(input.password);
  await transaction(async (client) => {
    await client.query(`UPDATE auth_users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [passwordHash, user.id]);
    await client.query(`UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, [user.id]);
    await audit(client, { userId: user.id, tenantId: user.tenantId, event: 'password-reset', outcome: 'granted', ipHash: privacyHash(input.ip) });
  });
  return true;
};

export const authenticate = async (input: { email: string; password: string; ip: string; userAgent: string }): Promise<{ rawSession: string; user: AuthUser } | undefined> => {
  const startedAt = Date.now();
  const email = normalizeEmail(input.email);
  const ipHash = privacyHash(input.ip);
  const allowed = isEmail(email) && await rateLimitAuthRequest('login', email || 'invalid', ipHash);
  const user = allowed ? await findUserByEmail(email) : undefined;
  const passwordOk = await verifyPassword(input.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  const eligible = Boolean(user && passwordOk && user.emailVerifiedAt && !user.disabledAt);
  await delayToFloor(startedAt);
  if (!eligible || !user) {
    if (user) await transaction((client) => audit(client, { userId: user.id, tenantId: user.tenantId, event: 'login', outcome: 'denied', ipHash }));
    return undefined;
  }
  const rawSession = randomToken(32);
  await transaction(async (client) => {
    await client.query(`INSERT INTO auth_sessions (id, user_id, token_hash, expires_at, ip_hash, user_agent_hash) VALUES ($1, $2, $3, NOW() + INTERVAL '${SESSION_HOURS} hours', $4, $5)`, [randomUUID(), user.id, tokenHash(rawSession), ipHash, privacyHash(input.userAgent)]);
    await audit(client, { userId: user.id, tenantId: user.tenantId, event: 'login', outcome: 'granted', ipHash });
  });
  return { rawSession, user: userFrom(user) };
};

export const currentUser = async (rawSession: string | undefined): Promise<AuthUser | undefined> => {
  if (!rawSession) return undefined;
  const rows = await query<SessionRow>(
    `SELECT auth_users.id AS "userId", auth_users.tenant_id AS "tenantId", auth_users.email, auth_users.name, auth_users.role, auth_users.email_verified_at AS "emailVerifiedAt", auth_users.disabled_at AS "disabledAt"
     FROM auth_sessions JOIN auth_users ON auth_users.id = auth_sessions.user_id
     WHERE auth_sessions.token_hash = $1 AND auth_sessions.revoked_at IS NULL AND auth_sessions.expires_at > NOW() LIMIT 1`,
    [tokenHash(rawSession)],
  );
  const row = rows[0];
  if (!row || !row.emailVerifiedAt || row.disabledAt) return undefined;
  await query(`UPDATE auth_sessions SET last_seen_at = NOW() WHERE token_hash = $1`, [tokenHash(rawSession)]);
  return { id: row.userId, tenantId: row.tenantId, email: row.email, name: row.name, role: row.role, emailVerifiedAt: row.emailVerifiedAt, disabledAt: row.disabledAt };
};

export const revokeSession = async (rawSession: string | undefined): Promise<void> => {
  if (rawSession) await query(`UPDATE auth_sessions SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL`, [tokenHash(rawSession)]);
};
