import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { legalDecisionNotice, legalDocuments, legalStatusNotice, modeBNotice } from '@/lib/launch/legal.ts';

export const metadata: Metadata = {
  title: 'Legal information | RipoDoc',
  description: 'Pre-launch legal, privacy, cookie, service-level, data-processing, and healthcare-mode information for RipoDoc.',
};

export default function LegalHubPage() {
  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Legal and trust information</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">Clear status before contractual launch.</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">RipoDoc is publishing its verified data-handling and security boundary while the accountable business owner finalizes the entity, commercial, jurisdiction, retention, and subprocessor decisions required for final legal documents.</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="flex items-start gap-3"><FileText className="mt-1 h-6 w-6 text-amber-700" aria-hidden="true" /><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Pre-launch legal status</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-amber-950">The final documents are not yet published as binding terms.</h2></div></div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-amber-950">{legalStatusNotice} {legalDecisionNotice}</p>
          </div>
          <aside className="rounded-3xl border border-cyan-200 bg-cyan-50 p-6">
            <ShieldCheck className="h-6 w-6 text-cyan-800" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold text-slate-950">Need the technical boundary?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">Review live-safe operational status and the private-worker/self-hosted deployment model before evaluating a data-processing workflow.</p>
            <div className="mt-5 flex flex-wrap gap-3"><Link href="/security" className="text-sm font-bold text-cyan-800 hover:text-cyan-950">Security controls</Link><Link href="/download" className="text-sm font-bold text-cyan-800 hover:text-cyan-950">Self-hosting</Link></div>
          </aside>
        </section>

        <section className="mt-10" aria-labelledby="documents-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Document status</p><h2 id="documents-heading" className="mt-1 text-3xl font-bold tracking-tight">What we can state today.</h2></div><p className="max-w-md text-sm leading-6 text-slate-600">Each page separates verified technical facts from decisions requiring an accountable business owner and counsel review.</p></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {legalDocuments.map((document) => (
              <Link key={document.key} href={document.href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-cyan-300 hover:bg-cyan-50/40 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-700">Pre-launch information</p><h3 className="mt-3 text-lg font-bold text-slate-950">{document.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{document.summary}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-800">Review status <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="healthcare-heading">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Healthcare boundary</p>
          <h2 id="healthcare-heading" className="mt-2 text-2xl font-bold tracking-tight">Healthcare Mode B prevents healthcare language from becoming a compliance promise.</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-700">{modeBNotice}</p>
          <Link href="/legal/healthcare-mode-b" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-800 hover:text-cyan-950">Read Healthcare Mode B <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </section>
      </main>
    </div>
  );
}
