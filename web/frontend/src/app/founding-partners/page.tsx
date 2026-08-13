import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileCheck2, ShieldCheck, UsersRound } from 'lucide-react';
import { ensureCsrfToken } from '@/lib/auth/server.ts';
import { captchaSiteKey } from '@/lib/auth/captcha.ts';
import { authConfigured } from '@/lib/auth/primitives.ts';
import { leadIntakeConfigured } from '@/lib/founder/lead-crypto.ts';
import { Turnstile } from '@/components/auth/Turnstile.tsx';
import { healthcareModeBEnabled } from '@/lib/launch/healthcare-webhooks.ts';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Founding report partners | RipoDoc',
  description: 'Help shape the secure evidence delivery workflow for MSP client reporting and QBRs.',
};

interface Props { readonly searchParams: Promise<{ readonly status?: string | readonly string[] }>; }
const state = (value: string | readonly string[] | undefined): string | undefined => typeof value === 'string' ? value : value?.[0];

export default async function FoundingPartnersPage({ searchParams }: Props) {
  const csrf = await ensureCsrfToken();
  const status = state((await searchParams).status);
  const modeB = healthcareModeBEnabled();
  const intakeReady = !modeB && authConfigured() && leadIntakeConfigured();

  return (
    <main className="bg-white text-[#11162E]">
      <section className="ripodoc-hero relative isolate overflow-hidden border-b border-slate-200">
        <div className="ripodoc-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-[#12B9BE]/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-24">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#12B9BE]/25 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-[#087E84]"><UsersRound className="h-3.5 w-3.5" aria-hidden="true" />MSP founding report partners</p>
            <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-[-0.06em] sm:text-6xl">Turn the QBR question into a <span className="brand-gradient-text">defensible answer.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">We are partnering with a small group of MSPs that already prepare client reports and want a better answer when an executive asks, “Where did that number come from?” You bring the real workflow; together we measure whether controlled evidence delivery earns a place in it.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#apply" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#1769E8] to-[#12B9BE] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-16px_rgba(23,105,232,0.8)] transition duration-200 hover:brightness-105 active:scale-[0.98]">Request a report diagnostic<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
              <Link href="/#demo" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#11162E] transition hover:border-[#12B9BE]/60">See the evidence experience<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-500">This is a paid, three-report-cycle design partnership—not an indefinite free pilot. We start with approved or redacted data and agree the security scope before any client information enters the workflow.</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_28px_60px_-32px_rgba(17,22,46,0.45)] backdrop-blur sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#087E84]">What we will prove together</p>
            <div className="mt-6 space-y-5">
              <Proof icon={FileCheck2} title="A real report workflow" body="Map three claims your client might challenge and connect each one to approved supporting detail." />
              <Proof icon={ShieldCheck} title="A controlled client answer" body="Test recipient proof, least-data delivery, expiry, revocation, and an audit event from the report experience." />
              <Proof icon={CheckCircle2} title="A measurable outcome" body="Compare preparation time, report-cycle completion, budget source, and your decision to continue after the agreed scope." />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#087E84]">Fit before features</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Best for MSPs with a report they already care about.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Fit title="You run recurring client reviews" body="Your team sends QBRs, monthly service reports, security reports, or a similar client-facing operational update." />
            <Fit title="Your client asks for detail" body="A client occasionally challenges a metric, needs the source rows, or receives more data than they should in a spreadsheet follow-up." />
            <Fit title="You can measure the current cost" body="You can identify the report owner, time spent, existing reporting tools, and the moment this workflow loses confidence." />
            <Fit title="You can start safely" body="You can use approved, non-sensitive, or redacted sample data while the data-processing and deployment scope is agreed." />
          </div>
        </div>
      </section>

      <section id="apply" className="border-y border-slate-200 bg-[#F6F8FC] py-16 lg:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#087E84]">Report diagnostic</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em]">Tell us how you report today.</h2>
            <p className="mt-5 text-base leading-7 text-slate-600">We use this short request to decide whether a report teardown would be useful. It captures only contact and workflow category information. It does not ask for report files, customer names, evidence rows, or credentials.</p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-600"><li>1. We review your reporting context and ask a small set of diagnostic questions.</li><li>2. We demonstrate a controlled evidence flow using sample or approved data.</li><li>3. If the workflow fits, we agree a paid three-cycle scope and success scorecard.</li></ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {status === 'received' ? <p className="rounded-xl border border-[#12B9BE]/25 bg-[#DDF9F7] p-4 text-sm leading-6 text-[#075D61]" role="status">Thanks. If the request is suitable for the founding-partner program, we will follow up with the next diagnostic step.</p> : null}
            {status === 'unavailable' ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950" role="status">Secure founding-partner intake is not yet available in this deployment. You can still inspect the evidence experience or use the self-hosted operator path.</p> : null}
            {intakeReady ? <PartnerForm csrf={csrf} /> : <div className="space-y-4"><p className="text-lg font-bold">{modeB ? 'Healthcare Mode B keeps public diagnostic intake closed.' : 'The secure intake path is being prepared.'}</p><p className="text-sm leading-6 text-slate-600">{modeB ? 'Do not submit PHI/ePHI, report data, or client information through this public site. Review the restricted healthcare evaluation boundary and use approved self-hosted processes only after the required contractual and security gates are complete.' : 'RipoDoc will not collect prospect information until durable identity, anti-automation, encrypted contact storage, and audit persistence pass the production readiness gate.'}</p><div className="flex flex-wrap gap-3"><Link href={modeB ? '/legal/healthcare-mode-b' : '/#demo'} className="inline-flex min-h-11 items-center rounded-xl bg-[#11162E] px-4 py-2.5 text-sm font-semibold text-white">{modeB ? 'Review Healthcare Mode B' : 'See the proof experience'}</Link><Link href="/download" className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-[#11162E]">Review self-hosting</Link></div></div>}
          </div>
        </div>
      </section>
    </main>
  );
}

function PartnerForm({ csrf }: { readonly csrf: string }) {
  return <form action="/api/founding-partners" method="post" className="space-y-4"><input type="hidden" name="csrf" value={csrf} /><input type="hidden" name="source" value="website" /><label className="block text-sm font-semibold">Your name<input required name="contactName" autoComplete="name" maxLength={120} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[#11162E]" /></label><label className="block text-sm font-semibold">MSP name<input required name="companyName" autoComplete="organization" maxLength={160} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[#11162E]" /></label><label className="block text-sm font-semibold">Work email<input required name="email" type="email" autoComplete="email" maxLength={254} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[#11162E]" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">MSP size<select required name="companySizeBand" defaultValue="" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[#11162E]"><option value="" disabled>Select one</option><option value="1-19">1–19 people</option><option value="20-49">20–49 people</option><option value="50-149">50–149 people</option><option value="150-plus">150+ people</option><option value="not-sure">Not sure</option></select></label><label className="block text-sm font-semibold">Current reporting<select required name="reportingToolBand" defaultValue="" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[#11162E]"><option value="" disabled>Select one</option><option value="manual">Manual PDF / spreadsheet</option><option value="bi">BI tool</option><option value="msp-reporting">MSP reporting tool</option><option value="portal">Client portal</option><option value="mixed">A mix of tools</option><option value="other">Other</option></select></label></div><label className="block text-sm font-semibold">Preferred operating model<select required name="interestMode" defaultValue="" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[#11162E]"><option value="" disabled>Select one</option><option value="hosted">Hosted evidence workspace</option><option value="self-hosted">Self-hosted application and private worker</option><option value="not-sure">Not sure yet</option></select></label><Turnstile siteKey={captchaSiteKey()} /><button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#1769E8] to-[#12B9BE] px-5 py-3 text-sm font-bold text-white transition hover:brightness-105" type="submit">Request a report diagnostic</button><p className="text-xs leading-5 text-slate-500">By submitting, you ask RipoDoc to contact you about the founding-partner program. Do not include report data or client information here.</p></form>;
}

function Proof({ icon: Icon, title, body }: { readonly icon: typeof FileCheck2; readonly title: string; readonly body: string }) { return <div className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1769E8]"><Icon className="h-5 w-5" aria-hidden="true" /></span><div><h3 className="font-bold tracking-[-0.02em]">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{body}</p></div></div>; }
function Fit({ title, body }: { readonly title: string; readonly body: string }) { return <article className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold tracking-[-0.02em]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></article>; }
