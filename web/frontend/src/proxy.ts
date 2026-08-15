import { NextResponse, type NextRequest } from 'next/server';
const AUTH_CSRF_COOKIE = 'ripodoc_csrf';
const TOKENIZED_EVIDENCE_PREFIX = '/e/';
const PRIVATE_ROBOTS_POLICY = 'noindex, nofollow, noarchive, nosnippet';
const edgeCsrfToken = (): string => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
};

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "connect-src 'self' https://challenges.cloudflare.com",
  "upgrade-insecure-requests",
].join('; ');

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', CSP);
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  if (request.nextUrl.pathname.startsWith(TOKENIZED_EVIDENCE_PREFIX)) {
    response.headers.set('X-Robots-Tag', PRIVATE_ROBOTS_POLICY);
  }
  if (!request.cookies.get(AUTH_CSRF_COOKIE)) {
    response.cookies.set({ name: AUTH_CSRF_COOKIE, value: edgeCsrfToken(), httpOnly: false, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 });
  }
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|reports/).*)'] };
