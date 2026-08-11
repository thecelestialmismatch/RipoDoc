import { notFound } from 'next/navigation';
import { CheckCircle2, KeyRound, MailCheck, ShieldCheck } from 'lucide-react';
import { ensureCsrfToken } from '@/lib/auth/server.ts';
import { evidenceSecret, revokedTokenIds } from '@/lib/evidence/config.ts';
import { currentUnixSeconds } from '@/lib/evidence/clock.ts';
import { verifyEvidenceToken } from '@/lib/evidence/token.ts';

interface Props {
  readonly params: Promise<{ readonly token: string }>;
  readonly searchParams: Promise<{ readonly status?: string | readonly string[] }>;
}

const state = (value: string | readonly string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function EvidenceAccessPage({ params, searchParams }: Props) {
  const { token } = await params;
  const verified = verifyEvidenceToken(token, evidenceSecret(), { now: await currentUnixSeconds(), revoked: revokedTokenIds() });
  if (!verified.ok) notFound();

  const csrf = await ensureCsrfToken();
  const status = state((await searchParams).status);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_78%_12%,rgba(34,211,238,0.16),transparent_28%),#020617] px-6 py-12 text-white sm:py-20">
      <section className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/95 shadow-2xl shadow-black/30 lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="border-b border-slate-800 bg-slate-950/70 p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/15 ring-1 ring-cyan-200/20">
            <ShieldCheck className="h-5 w-5 text-cyan-200" aria-hidden="true" />
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Recipient verification</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Evidence stays with the intended reader.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">Before RipoDoc reveals evidence, it confirms access through the mailbox associated with this report link. The PDF may travel; the underlying data does not automatically follow.</p>
          <ol className="mt-8 space-y-5 text-sm text-slate-300">
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-xs font-bold text-cyan-200">1</span><span><strong className="text-white">Request</strong><br />Send a short-lived code to the intended mailbox.</span></li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-xs font-bold text-cyan-200">2</span><span><strong className="text-white">Verify</strong><br />Enter the one-time code on this secure page.</span></li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-xs font-bold text-cyan-200">3</span><span><strong className="text-white">Inspect</strong><br />View only the evidence supporting the selected figure.</span></li>
          </ol>
        </aside>

        <div className="p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">RipoDoc evidence delivery</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Confirm access to this evidence.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">One-time codes are never stored in the report URL and this request is protected by browser origin and CSRF checks.</p>

          {status === 'sent' ? <p className="mt-6 flex items-start gap-3 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50" role="status"><MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" aria-hidden="true" />If delivery is permitted, a one-time code has been sent.</p> : null}
          {status === 'invalid' ? <p className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50" role="status"><KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />This code is invalid, expired, or already used. Request a new code and try again.</p> : null}

          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-white"><MailCheck className="h-4 w-4 text-cyan-300" aria-hidden="true" /> Step 1 — request a code</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">The request produces the same safe outcome whether delivery is available or not.</p>
            <form action="/api/evidence/proof" method="post" className="mt-4">
              <input type="hidden" name="csrf" value={csrf} />
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="action" value="send" />
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white transition hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950">Send one-time code</button>
            </form>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-white"><CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Step 2 — verify the code</div>
            <form action="/api/evidence/proof" method="post" className="mt-4 space-y-3">
              <input type="hidden" name="csrf" value={csrf} />
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="action" value="verify" />
              <label className="block text-sm font-semibold text-slate-200">One-time code<input required name="code" autoComplete="one-time-code" inputMode="text" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-white outline-none ring-cyan-300 placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2" /></label>
              <button type="submit" className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950">Verify and open evidence</button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
