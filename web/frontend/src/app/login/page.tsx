import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { ensureCsrfToken } from '@/lib/auth/server.ts';
import { captchaSiteKey } from '@/lib/auth/captcha.ts';
import { Turnstile } from '@/components/auth/Turnstile.tsx';

interface Props { readonly searchParams: Promise<{ readonly status?: string | readonly string[]; readonly next?: string | readonly string[] }>; }
const state = (value: string | readonly string[] | undefined) => Array.isArray(value) ? value[0] : value;
const safeNext = (value: string | undefined): '/upload' | undefined => value === '/upload' ? value : undefined;

export default async function LoginPage({ searchParams }: Props) {
  const csrf = await ensureCsrfToken();
  const params = await searchParams;
  const status = state(params.status);
  const next = safeNext(state(params.next));
  const message = status === 'unavailable' ? 'Secure account services have not been configured on this deployment.' : status === 'invalid' ? 'We could not complete that sign-in request.' : undefined;
  return <main className="stage-page min-h-[calc(100vh-76px)] bg-[#f8f0df] px-5 py-16 text-[#141111]"><section className="mx-auto max-w-md border border-[#141111] bg-[#141111] p-8 text-[#f8f0df] shadow-[8px_8px_0_#e8442e]"><KeyRound className="h-7 w-7 text-[#ff9b88]" aria-hidden="true" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#ff9b88]">RipoDoc workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Sign in securely.</h1><p className="mt-3 text-sm leading-6 text-[#f8f0df]/72">Your report workspace is protected by verified email and a private session.</p>{message ? <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100" role="alert">{message}</p> : null}<form action="/api/auth/login" method="post" className="mt-6 space-y-4"><input type="hidden" name="csrf" value={csrf} />{next ? <input type="hidden" name="next" value={next} /> : null}<label className="block text-sm font-semibold">Work email<input required name="email" type="email" autoComplete="email" maxLength={254} className="mt-2 w-full border border-[#f8f0df]/35 bg-[#141111] px-3 py-2.5 text-[#f8f0df]" /></label><label className="block text-sm font-semibold">Passphrase<input required name="password" type="password" autoComplete="current-password" maxLength={128} className="mt-2 w-full border border-[#f8f0df]/35 bg-[#141111] px-3 py-2.5 text-[#f8f0df]" /></label><Turnstile siteKey={captchaSiteKey()} /><button className="w-full bg-[#e8442e] px-4 py-3 text-sm font-bold text-[#f8f0df] transition hover:bg-[#b52e20]" type="submit">Sign in</button></form><div className="mt-6 flex items-center justify-between text-sm"><Link className="font-bold text-[#ff9b88] hover:text-cyan-200" href="/forgot-password">Forgot passphrase?</Link><Link className="font-bold text-[#ff9b88] hover:text-cyan-200" href="/signup">Create workspace</Link></div></section></main>;
}
