import { notFound } from 'next/navigation';
import { ensureCsrfToken } from '@/lib/auth/server.ts';
import { evidenceSecret, revokedTokenIds } from '@/lib/evidence/config.ts';
import { currentUnixSeconds } from '@/lib/evidence/clock.ts';
import { verifyEvidenceToken } from '@/lib/evidence/token.ts';

interface Props { readonly params: Promise<{ readonly token: string }>; readonly searchParams: Promise<{ readonly status?: string | readonly string[] }>; }
const state = (value: string | readonly string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function EvidenceAccessPage({ params, searchParams }: Props) {
  const { token } = await params;
  const verified = verifyEvidenceToken(token, evidenceSecret(), { now: await currentUnixSeconds(), revoked: revokedTokenIds() });
  if (!verified.ok) notFound();
  const csrf = await ensureCsrfToken();
  const status = state((await searchParams).status);
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-16"><section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Recipient verification</p><h1 className="mt-3 text-2xl font-bold text-slate-950">Confirm access to this evidence.</h1><p className="mt-3 text-sm leading-6 text-slate-600">To protect report evidence when a PDF is forwarded, RipoDoc sends a one-time code to the intended recipient before rendering data.</p>{status === 'sent' ? <p className="mt-5 rounded-xl bg-cyan-50 p-3 text-sm text-cyan-900">If delivery is permitted, a one-time code has been sent.</p> : status === 'invalid' ? <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">This code is invalid, expired, or already used.</p> : null}<form action="/api/evidence/proof" method="post" className="mt-6 space-y-3"><input type="hidden" name="csrf" value={csrf} /><input type="hidden" name="token" value={token} /><input type="hidden" name="action" value="send" /><button type="submit" className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Send one-time code</button></form><form action="/api/evidence/proof" method="post" className="mt-4 space-y-3"><input type="hidden" name="csrf" value={csrf} /><input type="hidden" name="token" value={token} /><input type="hidden" name="action" value="verify" /><label className="block text-sm font-bold text-slate-800">One-time code<input required name="code" autoComplete="one-time-code" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono" /></label><button type="submit" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-900">Verify and open evidence</button></form></section></main>;
}
