import { NextResponse } from 'next/server';
import { authConfigured, csrfToken, genericAuthMessage } from '@/lib/auth/primitives.ts';
import { verifyCaptcha } from '@/lib/auth/captcha.ts';
import { assertSameOriginAndCsrf, clearAuthCookies, clientIp, logoutCurrentSession, setAuthCookies } from '@/lib/auth/server.ts';
import { authenticate, createAccount, requestPasswordReset, resetPasswordWithCode, verifyEmailCode } from '@/lib/auth/service.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext { readonly params: Promise<{ readonly action: string }>; }

const destination = (request: Request, path: string, status: string): NextResponse => {
  const url = new URL(path, request.url);
  url.searchParams.set('status', status);
  return NextResponse.redirect(url, { status: 303 });
};

const unavailable = (request: Request): NextResponse => destination(request, '/login', 'unavailable');

export async function POST(request: Request, { params }: RouteContext): Promise<Response> {
  const { action } = await params;
  const form = await request.formData().catch(() => undefined);
  if (!form) return destination(request, '/login', 'invalid');
  const csrf = form.get('csrf');
  if (!(await assertSameOriginAndCsrf(request, csrf))) return destination(request, '/login', 'invalid');
  if (!authConfigured()) return unavailable(request);

  const ip = clientIp(request);
  if (action !== 'logout' && !(await verifyCaptcha(form.get('captcha'), ip))) return destination(request, action === 'login' ? '/login' : `/${action === 'forgot-password' ? 'forgot-password' : action}`, action === 'login' ? 'invalid' : 'sent');
  if (action === 'signup') {
    await createAccount({ name: String(form.get('name') ?? ''), email: String(form.get('email') ?? ''), password: String(form.get('password') ?? ''), ip });
    return destination(request, '/signup', 'sent');
  }
  if (action === 'login') {
    const result = await authenticate({ email: String(form.get('email') ?? ''), password: String(form.get('password') ?? ''), ip, userAgent: request.headers.get('user-agent') ?? 'unknown' });
    if (!result) return destination(request, '/login', 'invalid');
    return setAuthCookies(destination(request, '/dashboard', 'ok'), result.rawSession, csrfToken());
  }
  if (action === 'forgot-password') {
    await requestPasswordReset({ email: String(form.get('email') ?? ''), ip });
    return destination(request, '/forgot-password', 'sent');
  }
  if (action === 'verify-email') {
    const verified = await verifyEmailCode(String(form.get('code') ?? ''), ip);
    return destination(request, '/verify-email', verified ? 'verified' : 'invalid');
  }
  if (action === 'reset-password') {
    const reset = await resetPasswordWithCode({ code: String(form.get('code') ?? ''), password: String(form.get('password') ?? ''), ip });
    return destination(request, '/reset-password', reset ? 'updated' : 'invalid');
  }
  if (action === 'logout') {
    await logoutCurrentSession();
    return clearAuthCookies(destination(request, '/', 'signed-out'));
  }
  return NextResponse.json({ message: genericAuthMessage }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
}
