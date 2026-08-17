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
  return <main className="stage-page min-h-[calc(100vh-76px)] bg-[#f8f0df] px-5 py-16 text-[#141111]"><section className="mx-auto max-w-md border border-[#141111] bg-[#141111] p-8 text-[#f8f0df] shadow-[8px_8px_0_#e8442e]"><BadgeCheck className="h-7 w-7 text-[#ff9b88]" aria-hidden="true" /><h1 className="mt-5 text-3xl font-bold tracking-tight">Verify your email.</h1><p className="mt-3 text-sm leading-6 text-[#f8f0df]/72">Enter the one-time code from your email. Codes are never included in links or stored in browser history.</p>{status === 'verified' ? <p className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">Email verified. You can now sign in.</p> : status === 'invalid' ? <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">This code is invalid, expired, or has already been used.</p> : null}<form action="/api/auth/verify-email" method="post" className="mt-6 space-y-4"><input type="hidden" name="csrf" value={csrf} /><label className="block text-sm font-semibold">One-time code<input required name="code" autoComplete="one-time-code" inputMode="text" className="mt-2 w-full border border-[#f8f0df]/35 bg-[#141111] px-3 py-2.5 font-mono text-[#f8f0df]" /></label><Turnstile siteKey={captchaSiteKey()} /><button className="w-full bg-[#e8442e] px-4 py-3 text-sm font-bold text-[#f8f0df] transition hover:bg-[#b52e20]" type="submit">Verify email</button></form><p className="mt-6 text-center text-sm text-[#f8f0df]/55"><Link className="font-bold text-[#ff9b88]" href="/login">Back to sign in</Link></p></section></main>;
}
