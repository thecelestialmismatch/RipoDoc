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
  return <main className="min-h-[calc(100vh-64px)] bg-slate-950 px-6 py-16 text-white"><section className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"><ShieldCheck className="h-7 w-7 text-cyan-300" aria-hidden="true" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">RipoDoc workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Create your secure workspace.</h1><p className="mt-3 text-sm leading-6 text-slate-300">Your workspace activates only after you prove control of your email address.</p>{status === 'sent' ? <p className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100" role="status">If the request can be completed, you will receive further instructions shortly.</p> : null}<form action="/api/auth/signup" method="post" className="mt-6 space-y-4"><input type="hidden" name="csrf" value={csrf} /><label className="block text-sm font-semibold">Your name<input required name="name" autoComplete="name" maxLength={120} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label><label className="block text-sm font-semibold">Work email<input required name="email" type="email" autoComplete="email" maxLength={254} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label><label className="block text-sm font-semibold">Passphrase<input required name="password" type="password" autoComplete="new-password" minLength={15} maxLength={128} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /><span className="mt-1 block text-xs font-normal text-slate-400">Use at least 15 characters.</span></label><Turnstile siteKey={captchaSiteKey()} /><button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold" type="submit">Create secure workspace</button></form><p className="mt-6 text-center text-sm text-slate-400">Already have a workspace? <Link className="font-bold text-cyan-300 hover:text-cyan-200" href="/login">Sign in</Link></p></section></main>;
}
