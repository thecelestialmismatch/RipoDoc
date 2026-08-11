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
  return <main className="min-h-[calc(100vh-64px)] bg-slate-950 px-6 py-16 text-white"><section className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"><MailCheck className="h-7 w-7 text-cyan-300" aria-hidden="true" /><h1 className="mt-5 text-3xl font-bold tracking-tight">Recover your workspace.</h1><p className="mt-3 text-sm leading-6 text-slate-300">Enter your work email. We use the same response for every request to protect account privacy.</p>{status === 'sent' ? <p className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">If the request can be completed, you will receive further instructions shortly.</p> : null}<form action="/api/auth/forgot-password" method="post" className="mt-6 space-y-4"><input type="hidden" name="csrf" value={csrf} /><label className="block text-sm font-semibold">Work email<input required name="email" type="email" autoComplete="email" maxLength={254} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label><Turnstile siteKey={captchaSiteKey()} /><button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold" type="submit">Send recovery instructions</button></form><p className="mt-6 text-center text-sm text-slate-400"><Link className="font-bold text-cyan-300" href="/login">Back to sign in</Link></p></section></main>;
}
