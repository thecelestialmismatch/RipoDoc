import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_CSRF_COOKIE, AUTH_SESSION_COOKIE, csrfToken, safeCompare } from './primitives.ts';
import { currentUser, revokeSession, type AuthUser } from './service.ts';
import { databaseConfigured } from './database.ts';

const isProduction = process.env.NODE_ENV === 'production';

export const sessionCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: isProduction,
  path: '/',
  maxAge: 60 * 60 * 8,
});

export const csrfCookieOptions = () => ({
  httpOnly: false,
  sameSite: 'strict' as const,
  secure: isProduction,
  path: '/',
  maxAge: 60 * 60,
});

export const currentSessionUser = async (): Promise<AuthUser | undefined> => {
  if (!databaseConfigured()) return undefined;
  const store = await cookies();
  return currentUser(store.get(AUTH_SESSION_COOKIE)?.value);
};

export const ensureCsrfToken = async (): Promise<string> => {
  const store = await cookies();
  const existing = store.get(AUTH_CSRF_COOKIE)?.value;
  return existing ?? csrfToken();
};

export const setAuthCookies = (response: NextResponse, rawSession: string, csrf: string): NextResponse => {
  response.cookies.set({ name: AUTH_SESSION_COOKIE, value: rawSession, ...sessionCookieOptions() });
  response.cookies.set({ name: AUTH_CSRF_COOKIE, value: csrf, ...csrfCookieOptions() });
  return response;
};

export const clearAuthCookies = (response: NextResponse): NextResponse => {
  response.cookies.set({ name: AUTH_SESSION_COOKIE, value: '', ...sessionCookieOptions(), maxAge: 0 });
  response.cookies.set({ name: AUTH_CSRF_COOKIE, value: '', ...csrfCookieOptions(), maxAge: 0 });
  return response;
};

export const assertSameOriginAndCsrf = async (request: Request, suppliedToken: unknown): Promise<boolean> => {
  const appOrigin = process.env.RIPODOC_APP_ORIGIN;
  const origin = request.headers.get('origin');
  const requestHeaders = await headers();
  const fetchSite = requestHeaders.get('sec-fetch-site');
  if (!appOrigin || origin !== new URL(appOrigin).origin || (fetchSite && fetchSite !== 'same-origin')) return false;
  const store = await cookies();
  const csrf = store.get(AUTH_CSRF_COOKIE)?.value;
  return typeof suppliedToken === 'string' && typeof csrf === 'string' && safeCompare(suppliedToken, csrf);
};

export const logoutCurrentSession = async (): Promise<void> => {
  const store = await cookies();
  await revokeSession(store.get(AUTH_SESSION_COOKIE)?.value);
};

export const clientIp = (request: Request): string => request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
