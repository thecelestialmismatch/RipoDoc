import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { ensureCsrfToken } from '@/lib/auth/server.ts';
import { captchaSiteKey } from '@/lib/auth/captcha.ts';
import { Turnstile } from '@/components/auth/Turnstile.tsx';

interface Props { readonly searchParams: Promise<{ readonly status?: string | readonly string[] }>; }
const state = (value: string | readonly string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function SignupPage({ searchParams }: Props) {
  const csrf = await ensureCsrfToken();
  const status = state((await searchParams).status);
  return <main className="signal-page min-h-[calc(100vh-68px)] bg-[var(--rd-canvas)] py-10 sm:py-16"><section className="signal-card mx-auto w-[min(100%-40px,34rem)] p-7 sm:p-9"><ShieldCheck className="h-6 w-6 text-[var(--rd-signal)]" aria-hidden="true" /><p className="mt-6 font-mono text-[.65rem] font-bold uppercase tracking-[.12em] text-[var(--rd-signal)]">RipoDoc workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] text-[var(--rd-ink)]">Create your secure workspace.</h1><p className="mt-3 text-sm leading-6 text-[var(--rd-ink-soft)]">Your workspace activates only after you prove control of your email address.</p>{status === 'sent' ? <p className="mt-5 rounded-xl border border-[var(--rd-signal)]/25 bg-[var(--rd-signal-soft)] p-3 text-sm text-[var(--rd-ink)]" role="status">If the request can be completed, you will receive further instructions shortly.</p> : null}<form action="/api/auth/signup" method="post" className="mt-7 space-y-5"><input type="hidden" name="csrf" value={csrf} /><label className="block text-sm font-semibold text-[var(--rd-ink)]">Your name<input required name="name" autoComplete="name" maxLength={120} className="signal-field mt-2" /></label><label className="block text-sm font-semibold text-[var(--rd-ink)]">Work email<input required name="email" type="email" autoComplete="email" maxLength={254} className="signal-field mt-2" /></label><label className="block text-sm font-semibold text-[var(--rd-ink)]">Passphrase<input required name="password" type="password" autoComplete="new-password" minLength={15} maxLength={128} className="signal-field mt-2" /><span className="mt-1 block text-xs font-normal text-[var(--rd-ink-faint)]">Use at least 15 characters.</span></label><Turnstile siteKey={captchaSiteKey()} /><button className="signal-button w-full" type="submit">Create secure workspace</button></form><p className="mt-6 text-center text-sm text-[var(--rd-ink-soft)]">Already have a workspace? <Link className="signal-link" href="/login">Sign in</Link></p></section></main>;
}
