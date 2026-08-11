import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'ripodoc_admin_session';

const sessionDigest = (accessKey: string): string =>
  createHmac('sha256', accessKey).update('ripodoc.admin.session.v1').digest('base64url');

const compare = (left: string, right: string): boolean => {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
};

/** A production administrator key must be supplied through server-only environment configuration. */
export const adminAccessKey = (): string | undefined => {
  const key = process.env.RIPODOC_ADMIN_ACCESS_KEY;
  return key && key.length >= 16 ? key : undefined;
};

export const adminAccessConfigured = (): boolean => adminAccessKey() !== undefined;

export const validAdminAccessKey = (candidate: unknown): boolean => {
  const configured = adminAccessKey();
  return typeof candidate === 'string' && configured !== undefined && compare(candidate, configured);
};

export const adminSessionValue = (): string | undefined => {
  const key = adminAccessKey();
  return key ? sessionDigest(key) : undefined;
};

export const validAdminSessionValue = (candidate: unknown): boolean => {
  const expected = adminSessionValue();
  return typeof candidate === 'string' && expected !== undefined && compare(candidate, expected);
};
