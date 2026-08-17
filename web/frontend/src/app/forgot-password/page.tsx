import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { ensureCsrfToken } from '@/lib/auth/server.ts';
import { captchaSiteKey } from '@/lib/auth/captcha.ts';
import { Turnstile } from '@/components/auth/Turnstile.tsx';

interface Props { readonly searchParams: Promise<{ readonly status?: string | readonly string[] }>; }
const state = (value: string | readonly string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const csrf = await ensureCsrfToken();
  const status = state((await searchParams).status);
  return <main className="signal-page min-h-[calc(100vh-68px)] bg-[var(--rd-canvas)] py-10 sm:py-16"><section className="signal-card mx-auto w-[min(100%-40px,34rem)] p-7 sm:p-9"><MailCheck className="h-6 w-6 text-[var(--rd-signal)]" aria-hidden="true" /><p className="mt-6 font-mono text-[.65rem] font-bold uppercase tracking-[.12em] text-[var(--rd-signal)]">Account recovery</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-[var(--rd-ink)]">Recover your workspace.</h1><p className="mt-3 text-sm leading-6 text-[var(--rd-ink-soft)]">Enter your work email. We use the same response for every request to protect account privacy.</p>{status === 'sent' ? <p className="mt-5 rounded-xl border border-[var(--rd-signal)]/25 bg-[var(--rd-signal-soft)] p-3 text-sm text-[var(--rd-ink)]">If the request can be completed, you will receive further instructions shortly.</p> : null}<form action="/api/auth/forgot-password" method="post" className="mt-7 space-y-5"><input type="hidden" name="csrf" value={csrf} /><label className="block text-sm font-semibold text-[var(--rd-ink)]">Work email<input required name="email" type="email" autoComplete="email" maxLength={254} className="signal-field mt-2" /></label><Turnstile siteKey={captchaSiteKey()} /><button className="signal-button w-full" type="submit">Send recovery instructions</button></form><p className="mt-6 text-center text-sm"><Link className="signal-link" href="/login">Back to sign in</Link></p></section></main>;
}
