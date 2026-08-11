import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

const SCRYPT_N = 1 << 15;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const MAX_PASSWORD_BYTES = 128;

export const AUTH_SESSION_COOKIE = 'ripodoc_session';
export const AUTH_CSRF_COOKIE = 'ripodoc_csrf';

const decode = (value: string): Buffer => Buffer.from(value, 'base64url');

export const safeCompare = (left: string, right: string): boolean => {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
};

export const authSecret = (): string => {
  const secret = process.env.RIPODOC_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('RIPODOC_AUTH_SECRET must be a server-only value of at least 32 characters.');
  return secret;
};

export const authDatabaseUrl = (): string | undefined => process.env.RIPODOC_DATABASE_URL;
export const authConfigured = (): boolean => Boolean(authDatabaseUrl() && process.env.RIPODOC_AUTH_SECRET && process.env.RIPODOC_APP_ORIGIN && process.env.RIPODOC_RESEND_API_KEY && process.env.RIPODOC_EMAIL_FROM && (process.env.NODE_ENV !== 'production' || (process.env.RIPODOC_TURNSTILE_SECRET && process.env.NEXT_PUBLIC_RIPODOC_TURNSTILE_SITE_KEY)));

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

export const validatePassword = (value: string): string | undefined => {
  const byteLength = Buffer.byteLength(value, 'utf8');
  if (value.length < 15) return 'Use a passphrase of at least 15 characters.';
  if (byteLength > MAX_PASSWORD_BYTES) return 'Password is too long.';
  return undefined;
};

const derive = async (password: string, salt: Buffer): Promise<Buffer> => new Promise((resolve, reject) => {
  scryptCallback(password, salt, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: 96 * 1024 * 1024 }, (error, derived) => {
    if (error) reject(error);
    else resolve(derived);
  });
});

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const derived = await derive(password, salt);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64url')}$${derived.toString('base64url')}`;
};

export const verifyPassword = async (password: string, encoded: string): Promise<boolean> => {
  const [algorithm, n, r, p, saltText, digestText] = encoded.split('$');
  if (algorithm !== 'scrypt' || n !== String(SCRYPT_N) || r !== String(SCRYPT_R) || p !== String(SCRYPT_P) || !saltText || !digestText) {
    await hashPassword(password);
    return false;
  }
  try {
    const derived = await derive(password, decode(saltText));
    return safeCompare(derived.toString('base64url'), digestText);
  } catch {
    await hashPassword(password);
    return false;
  }
};

export const randomToken = (bytes = 32): string => randomBytes(bytes).toString('base64url');
export const tokenHash = (token: string): string => createHmac('sha256', authSecret()).update(token).digest('base64url');
export const privacyHash = (value: string): string => createHmac('sha256', authSecret()).update(value).digest('base64url');
export const csrfToken = (): string => randomToken(24);

export const genericAuthMessage = 'If the request can be completed, you will receive further instructions shortly.';

export const delayToFloor = async (startedAt: number, floorMs = 900): Promise<void> => {
  const remaining = floorMs - (Date.now() - startedAt);
  if (remaining > 0) await new Promise<void>((resolve) => setTimeout(resolve, remaining));
};
