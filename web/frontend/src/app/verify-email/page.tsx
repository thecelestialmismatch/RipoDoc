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
  return <main className="signal-page min-h-[calc(100vh-68px)] bg-[var(--rd-canvas)] py-10 sm:py-16"><section className="signal-card mx-auto w-[min(100%-40px,34rem)] p-7 sm:p-9"><BadgeCheck className="h-6 w-6 text-[var(--rd-signal)]" aria-hidden="true" /><p className="mt-6 font-mono text-[.65rem] font-bold uppercase tracking-[.12em] text-[var(--rd-signal)]">Workspace verification</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-[var(--rd-ink)]">Verify your email.</h1><p className="mt-3 text-sm leading-6 text-[var(--rd-ink-soft)]">Enter the one-time code from your email. Codes are never included in links or stored in browser history.</p>{status === 'verified' ? <p className="mt-5 rounded-xl border border-[var(--rd-success)]/25 bg-[var(--rd-success-soft)] p-3 text-sm text-[#14583f]">Email verified. You can now sign in.</p> : status === 'invalid' ? <p className="mt-5 rounded-xl border border-[var(--rd-warning)]/30 bg-[var(--rd-warning-soft)] p-3 text-sm text-[#653a0d]">This code is invalid, expired, or has already been used.</p> : null}<form action="/api/auth/verify-email" method="post" className="mt-7 space-y-5"><input type="hidden" name="csrf" value={csrf} /><label className="block text-sm font-semibold text-[var(--rd-ink)]">One-time code<input required name="code" autoComplete="one-time-code" inputMode="text" className="signal-field mt-2 font-mono" /></label><Turnstile siteKey={captchaSiteKey()} /><button className="signal-button w-full" type="submit">Verify email</button></form><p className="mt-6 text-center text-sm"><Link className="signal-link" href="/login">Back to sign in</Link></p></section></main>;
}
