'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Check, Circle, FileSearch, ShieldCheck } from 'lucide-react';

const checks = [
  { id: 'claim', label: 'The claim is specific', question: 'Can the report state the metric as a clear claim a client could reasonably challenge?', detail: 'Example: “Patch compliance remained above 98% every week this quarter,” not “patching was good.”' },
  { id: 'source', label: 'The source is reviewable', question: 'Do you have a reviewed structured source, such as a CSV, API response, or database export?', detail: 'A screenshot or visually rendered chart is not enough to establish the supporting rows and meaning.' },
  { id: 'scope', label: 'The evidence can be narrowed', question: 'Can the rows, context, and provenance be limited to the one report claim?', detail: 'The goal is a least-data response, not a customer-wide data export.' },
  { id: 'reader', label: 'The reader matters', question: 'Is there an intended reader, or a reason the evidence should not be broadly forwarded?', detail: 'This is where recipient-aware access, expiry and revocation add value.' },
  { id: 'review', label: 'Someone owns approval', question: 'Has an accountable person reviewed the report wording, evidence scope, and source context?', detail: 'A controlled proof view begins with a deliberate publication decision.' },
] as const;

type CheckId = (typeof checks)[number]['id'];
type CheckState = Record<CheckId, boolean>;

const emptyState: CheckState = { claim: false, source: false, scope: false, reader: false, review: false };

export function EvidenceReadinessCheck() {
  const [selected, setSelected] = useState<CheckState>(emptyState);
  const completed = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);
  const result = completed === checks.length
    ? { label: 'Evidence-ready pattern', title: 'This metric has the ingredients for a controlled proof path.', body: 'The next step is to prepare an approved manifest: map the claim to its evidence, provenance, intended reader, expiry, and reviewer decision. A result here is workflow guidance—not a security, legal, or compliance certification.', tone: 'ready' }
    : completed >= 3
      ? { label: 'Boundary needs definition', title: 'The reporting idea is strong; define the missing controls before publishing proof.', body: 'Start with the unchecked items. Most teams benefit from clarifying the evidence scope and accountable review before choosing any delivery mechanism.', tone: 'partial' }
      : { label: 'Start with the reporting foundation', title: 'Make the claim and source more deliberate before adding a proof path.', body: 'A controlled evidence experience cannot repair an unclear metric or an unreviewable source. Start with a concrete report claim and a structured, reviewable data source.', tone: 'start' };

  return <section className="document-cut border border-slate-200 bg-white p-5 shadow-[0_26px_65px_-42px_rgba(7,19,45,0.65)] sm:p-7" aria-labelledby="readiness-tool-heading">
    <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#007e83]">No data leaves this page</p><h2 id="readiness-tool-heading" className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#0b1226]">Assess one report metric.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Choose the statements that are true today. This is a local decision aid; it does not submit, store, or score your report data.</p></div><span className="w-fit border border-[#2f62e8]/20 bg-[#e7f0ff] px-3 py-1.5 font-mono text-xs font-bold text-[#17378d]">{completed} / {checks.length} READY</span></div>
    <div className="divide-y divide-slate-200">{checks.map((check, index) => { const active = selected[check.id]; return <button key={check.id} type="button" onClick={() => setSelected((current) => ({ ...current, [check.id]: !current[check.id] }))} className={`group grid w-full grid-cols-[32px_1fr] gap-4 py-5 text-left transition ${active ? 'bg-[#f0fdf9]' : 'hover:bg-slate-50'}`} aria-pressed={active}><span className={`mt-0.5 flex h-7 w-7 items-center justify-center border ${active ? 'border-[#007e83] bg-[#007e83] text-white' : 'border-slate-300 bg-white text-slate-400'}`}>{active ? <Check className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-3.5 w-3.5" aria-hidden="true" />}</span><span><span className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="font-mono text-[10px] font-bold tracking-[0.14em] text-[#2f62e8]">0{index + 1}</span><span className="text-sm font-bold text-[#0b1226]">{check.label}</span></span><span className="mt-2 block text-sm font-medium leading-6 text-slate-700">{check.question}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{check.detail}</span></span></button>; })}</div>
    <div className={`mt-6 border p-5 ${result.tone === 'ready' ? 'border-[#007e83]/25 bg-[#dcfbf5]' : result.tone === 'partial' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-[#f7f9fd]'}`} aria-live="polite"><div className="flex items-start gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center ${result.tone === 'ready' ? 'bg-[#007e83] text-white' : result.tone === 'partial' ? 'bg-amber-200 text-amber-900' : 'bg-[#e7f0ff] text-[#2f62e8]'}`}>{result.tone === 'ready' ? <ShieldCheck className="h-4 w-4" aria-hidden="true" /> : <FileSearch className="h-4 w-4" aria-hidden="true" />}</span><div><p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${result.tone === 'ready' ? 'text-[#007e83]' : result.tone === 'partial' ? 'text-amber-900' : 'text-[#17378d]'}`}>{result.label}</p><h3 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#0b1226]">{result.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{result.body}</p></div></div><div className="mt-5 flex flex-wrap gap-3"><Link href="/how-it-works" className="inline-flex items-center gap-2 bg-[#0b1226] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#17378d]">Read the method <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/founding-partners" className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-[#17378d] transition hover:border-[#2f62e8]">Request a report diagnostic <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>
  </section>;
}
