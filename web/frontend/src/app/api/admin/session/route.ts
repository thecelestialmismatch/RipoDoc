import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  adminAccessConfigured,
  adminSessionValue,
  validAdminAccessKey,
} from '@/lib/admin/session.ts';

export const runtime = 'nodejs';

const loginUrl = (request: Request, error?: string): URL => {
  const url = new URL('/admin/login', request.url);
  if (error) url.searchParams.set('error', error);
  return url;
};

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  if (form.get('_method') === 'delete') {
    const response = NextResponse.redirect(new URL('/', request.url), { status: 303 });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: '',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/admin',
      maxAge: 0,
    });
    return response;
  }

  if (!adminAccessConfigured()) {
    return NextResponse.redirect(loginUrl(request, 'not-configured'), { status: 303 });
  }

  const accessKey = form.get('accessKey');
  if (!validAdminAccessKey(accessKey)) {
    return NextResponse.redirect(loginUrl(request, 'invalid'), { status: 303 });
  }

  const response = NextResponse.redirect(new URL('/admin', request.url), { status: 303 });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: adminSessionValue() as string,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE(request: Request): Promise<Response> {
  const response = NextResponse.redirect(new URL('/', request.url), { status: 303 });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 0,
  });
  return response;
}
