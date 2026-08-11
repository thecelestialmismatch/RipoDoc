import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { ensureCsrfToken } from '@/lib/auth/server.ts';
import { captchaSiteKey } from '@/lib/auth/captcha.ts';
import { Turnstile } from '@/components/auth/Turnstile.tsx';

interface Props { readonly searchParams: Promise<{ readonly status?: string | readonly string[] }>; }
const state = (value: string | readonly string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function ResetPasswordPage({ searchParams }: Props) {
  const csrf = await ensureCsrfToken();
  const status = state((await searchParams).status);
  return <main className="min-h-[calc(100vh-64px)] bg-slate-950 px-6 py-16 text-white"><section className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"><LockKeyhole className="h-7 w-7 text-cyan-300" aria-hidden="true" /><h1 className="mt-5 text-3xl font-bold tracking-tight">Set a new passphrase.</h1><p className="mt-3 text-sm leading-6 text-slate-300">Enter the one-time code from your email and a new passphrase. Using the code revokes every existing workspace session.</p>{status === 'updated' ? <p className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">Your passphrase was updated. Sign in with the new passphrase.</p> : status === 'invalid' ? <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">This request could not be completed. Request a new code and try again.</p> : null}<form action="/api/auth/reset-password" method="post" className="mt-6 space-y-4"><input type="hidden" name="csrf" value={csrf} /><label className="block text-sm font-semibold">One-time code<input required name="code" autoComplete="one-time-code" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-white" /></label><label className="block text-sm font-semibold">New passphrase<input required name="password" type="password" autoComplete="new-password" minLength={15} maxLength={128} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /><span className="mt-1 block text-xs font-normal text-slate-400">At least 15 characters.</span></label><Turnstile siteKey={captchaSiteKey()} /><button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold" type="submit">Reset passphrase</button></form><p className="mt-6 text-center text-sm text-slate-400"><Link className="font-bold text-cyan-300" href="/login">Back to sign in</Link></p></section></main>;
}
