import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AuthUser } from '@/lib/auth/service.ts';
import { configuredPrivateWorkerBaseUrl, privateWorkerConfigured } from './worker-url.ts';

export const AUTHORING_SCOPES = [
  'upload',
  'proposal-download',
  'review',
  'publish',
  'artifact-download',
  'draft-read',
  'draft-update',
  'draft-delete',
] as const;

export type AuthoringScope = (typeof AUTHORING_SCOPES)[number];

type WorkerCapability = Readonly<{
  aud: 'ripodoc-authoring-worker';
  v: 1;
  sub: string;
  tid: string;
  role: AuthUser['role'];
  scope: AuthoringScope;
  draftId?: string;
  jti: string;
  iat: number;
  exp: number;
}>;

const MAX_CAPABILITY_SECONDS = 90;
const allowedRoles = new Set<AuthUser['role']>(['owner', 'admin', 'author']);

const base64urlJson = (value: unknown): string => Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');

const capabilitySecret = (): string | undefined => {
  const value = process.env.RIPODOC_WORKER_AUTH_SECRET;
  return value && value.length >= 32 ? value : undefined;
};

const workerBaseUrl = (): string | undefined => configuredPrivateWorkerBaseUrl();

export const authoringConfigured = (): boolean => Boolean(capabilitySecret() && privateWorkerConfigured());

export const canAuthorReports = (user: AuthUser | undefined): user is AuthUser => Boolean(
  user && user.emailVerifiedAt && !user.disabledAt && allowedRoles.has(user.role) && authoringConfigured(),
);

const sign = (value: string): string => createHmac('sha256', capabilitySecret()!).update(value).digest('base64url');

export const issueWorkerCapability = (user: AuthUser, scope: AuthoringScope, draftId?: string): string => {
  const now = Math.floor(Date.now() / 1000);
  const payload: WorkerCapability = {
    aud: 'ripodoc-authoring-worker',
    v: 1,
    sub: user.id,
    tid: user.tenantId,
    role: user.role,
    scope,
    ...(draftId ? { draftId } : {}),
    jti: randomBytes(18).toString('base64url'),
    iat: now,
    exp: now + MAX_CAPABILITY_SECONDS,
  };
  const encoded = base64urlJson(payload);
  return `${encoded}.${sign(encoded)}`;
};

export const workerRequest = async (
  user: AuthUser,
  scope: AuthoringScope,
  path: string,
  init: RequestInit = {},
  draftId?: string,
): Promise<Response> => {
  if (!canAuthorReports(user)) throw new Error('Authoring is not configured for this workspace.');
  const base = workerBaseUrl();
  if (!base) throw new Error('Authoring worker is unavailable.');
  const normalizedPath = path.replace(/^\//, '');
  const capability = issueWorkerCapability(user, scope, draftId);
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${capability}`);
  headers.set('X-RipoDoc-Request-Id', randomBytes(12).toString('base64url'));
  if (draftId) headers.set('X-RipoDoc-Draft-Id', draftId);
  try {
    return await fetch(`${base}/${normalizedPath}`, { ...init, headers, cache: 'no-store' });
  } catch {
    return new Response(JSON.stringify({ error: 'worker-unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'X-RipoDoc-Request-Id': headers.get('X-RipoDoc-Request-Id') ?? '' },
    });
  }
};

export const opaqueWorkerError = (response: Response): { status: number; error: string; requestId?: string } => {
  const requestId = response.headers.get('x-ripodoc-request-id') ?? undefined;
  if (response.status === 401 || response.status === 403) return { status: response.status, error: 'This authoring request is not authorized.', requestId };
  if (response.status === 404) return { status: 404, error: 'The requested authoring artifact is unavailable.', requestId };
  if (response.status === 413) return { status: 413, error: 'This file exceeds the authoring limit.', requestId };
  if (response.status === 429) return { status: 429, error: 'The private worker is busy. Please retry shortly.', requestId };
  if (response.status >= 500) return { status: 502, error: 'The private worker could not complete this request.', requestId };
  return { status: response.status, error: 'This authoring request could not be completed.', requestId };
};

/** Worker-side verification parity tests use the same wire contract. */
export const capabilitySignatureMatches = (encoded: string, signature: string): boolean => {
  const expected = Buffer.from(sign(encoded));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
};
