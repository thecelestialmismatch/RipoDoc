import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { ensureCsrfToken } from '@/lib/auth/server.ts';
import { captchaSiteKey } from '@/lib/auth/captcha.ts';
import { Turnstile } from '@/components/auth/Turnstile.tsx';

interface Props { readonly searchParams: Promise<{ readonly status?: string | readonly string[] }>; }
const state = (value: string | readonly string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function VerifyEmailPage({ searchParams }: Props) {
  const csrf = await ensureCsrfToken();
  const status = state((await searchParams).status);
  return <main className="min-h-[calc(100vh-64px)] bg-slate-950 px-6 py-16 text-white"><section className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"><BadgeCheck className="h-7 w-7 text-cyan-300" aria-hidden="true" /><h1 className="mt-5 text-3xl font-bold tracking-tight">Verify your email.</h1><p className="mt-3 text-sm leading-6 text-slate-300">Enter the one-time code from your email. Codes are never included in links or stored in browser history.</p>{status === 'verified' ? <p className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">Email verified. You can now sign in.</p> : status === 'invalid' ? <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">This code is invalid, expired, or has already been used.</p> : null}<form action="/api/auth/verify-email" method="post" className="mt-6 space-y-4"><input type="hidden" name="csrf" value={csrf} /><label className="block text-sm font-semibold">One-time code<input required name="code" autoComplete="one-time-code" inputMode="text" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-white" /></label><Turnstile siteKey={captchaSiteKey()} /><button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold" type="submit">Verify email</button></form><p className="mt-6 text-center text-sm text-slate-400"><Link className="font-bold text-cyan-300" href="/login">Back to sign in</Link></p></section></main>;
}
