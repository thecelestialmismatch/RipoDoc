import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { ensureCsrfToken } from '@/lib/auth/server.ts';
import { captchaSiteKey } from '@/lib/auth/captcha.ts';
import { Turnstile } from '@/components/auth/Turnstile.tsx';

interface Props { readonly searchParams: Promise<{ readonly status?: string | readonly string[] }>; }
const state = (value: string | readonly string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function LoginPage({ searchParams }: Props) {
  const csrf = await ensureCsrfToken();
  const status = state((await searchParams).status);
  const message = status === 'unavailable' ? 'Secure account services have not been configured on this deployment.' : status === 'invalid' ? 'We could not complete that sign-in request.' : undefined;
  return <main className="min-h-[calc(100vh-64px)] bg-slate-950 px-6 py-16 text-white"><section className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"><KeyRound className="h-7 w-7 text-cyan-300" aria-hidden="true" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">RipoDoc workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Sign in securely.</h1><p className="mt-3 text-sm leading-6 text-slate-300">Your report workspace is protected by verified email and a private session.</p>{message ? <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100" role="alert">{message}</p> : null}<form action="/api/auth/login" method="post" className="mt-6 space-y-4"><input type="hidden" name="csrf" value={csrf} /><label className="block text-sm font-semibold">Work email<input required name="email" type="email" autoComplete="email" maxLength={254} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label><label className="block text-sm font-semibold">Passphrase<input required name="password" type="password" autoComplete="current-password" maxLength={128} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label><Turnstile siteKey={captchaSiteKey()} /><button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold" type="submit">Sign in</button></form><div className="mt-6 flex items-center justify-between text-sm"><Link className="font-bold text-cyan-300 hover:text-cyan-200" href="/forgot-password">Forgot passphrase?</Link><Link className="font-bold text-cyan-300 hover:text-cyan-200" href="/signup">Create workspace</Link></div></section></main>;
}
