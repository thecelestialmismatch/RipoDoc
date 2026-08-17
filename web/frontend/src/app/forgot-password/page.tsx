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
  return <main className="stage-page min-h-[calc(100vh-76px)] bg-[#f8f0df] px-5 py-16 text-[#141111]"><section className="mx-auto max-w-md border border-[#141111] bg-[#141111] p-8 text-[#f8f0df] shadow-[8px_8px_0_#e8442e]"><MailCheck className="h-7 w-7 text-[#ff9b88]" aria-hidden="true" /><h1 className="mt-5 text-3xl font-bold tracking-tight">Recover your workspace.</h1><p className="mt-3 text-sm leading-6 text-[#f8f0df]/72">Enter your work email. We use the same response for every request to protect account privacy.</p>{status === 'sent' ? <p className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">If the request can be completed, you will receive further instructions shortly.</p> : null}<form action="/api/auth/forgot-password" method="post" className="mt-6 space-y-4"><input type="hidden" name="csrf" value={csrf} /><label className="block text-sm font-semibold">Work email<input required name="email" type="email" autoComplete="email" maxLength={254} className="mt-2 w-full border border-[#f8f0df]/35 bg-[#141111] px-3 py-2.5 text-[#f8f0df]" /></label><Turnstile siteKey={captchaSiteKey()} /><button className="w-full bg-[#e8442e] px-4 py-3 text-sm font-bold text-[#f8f0df] transition hover:bg-[#b52e20]" type="submit">Send recovery instructions</button></form><p className="mt-6 text-center text-sm text-[#f8f0df]/55"><Link className="font-bold text-[#ff9b88]" href="/login">Back to sign in</Link></p></section></main>;
}
