'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, FileText, LockKeyhole, ReceiptText, X } from 'lucide-react';
import { EvidenceGrid } from '@/components/evidence/EvidenceGrid.tsx';
import type { ReportElement, ReportManifest } from '@/lib/evidence/types.ts';

/**
 * A public, sample-data-only version of the same evidence interaction a reader
 * opens from a RipoDoc PDF. It remains intentionally ungated so the product
 * behavior can be evaluated without a token or client information.
 */
export function SampleReport({ manifest }: { readonly manifest: ReportManifest }) {
  const [active, setActive] = useState<ReportElement | null>(null);
  const kpis = manifest.elements.filter((element) => element.kind === 'kpi');
  const chart = manifest.elements.find((element) => element.kind === 'bar-chart');
  const claims = manifest.elements.filter((element) => element.kind === 'claim');
  const maxBar = Math.max(...(chart?.series ?? []).map((datum) => datum.value), 1);

  return (
    <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section aria-label="Sample report figures" className="min-w-0 border border-[#141111] bg-[#f7ecdc] p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#141111]/20 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#b52e20]"><FileText className="h-3.5 w-3.5" aria-hidden="true" />{manifest.provider}</div>
            <h3 className="mt-1 text-base font-bold tracking-[-0.025em] text-[#141111]">{manifest.title}</h3>
            <p className="mt-0.5 text-xs text-[#857b72]">{manifest.client} · {manifest.periodLabel}</p>
          </div>
          <span className="inline-flex items-center gap-1 border border-[#141111]/25 bg-[#fff9ef] px-2 py-1 text-[10px] font-semibold text-[#857b72]"><MouseCue />Click a figure</span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {kpis.map((element) => (
            <button
              key={element.id}
              type="button"
              onClick={() => setActive(element)}
              aria-pressed={active?.id === element.id}
              className={`border p-2.5 text-left transition duration-200 focus:outline-none ${
                active?.id === element.id ? 'border-[#e8442e] bg-[#f0dfcc] shadow-sm' : 'border-[#141111]/20 bg-[#fff9ef] hover:border-[#e8442e] hover:bg-[#f0dfcc]'
              }`}
            >
              <span className="block text-lg font-bold tracking-[-0.05em] text-[#141111]">{element.value}</span>
              <span className="mt-1 block text-[10px] leading-4 text-[#655c55]">{element.label}</span>
            </button>
          ))}
        </div>

        {chart && (
          <button
            type="button"
            onClick={() => setActive(chart)}
            aria-pressed={active?.id === chart.id}
            className={`mt-2.5 w-full border p-3 text-left transition duration-200 focus:outline-none ${
              active?.id === chart.id ? 'border-[#e8442e] bg-[#f0dfcc] shadow-sm' : 'border-[#141111]/20 bg-[#fff9ef] hover:border-[#e8442e] hover:bg-[#f0dfcc]'
            }`}
          >
            <span className="text-xs font-semibold text-[#141111]">{chart.label}</span>
            <span className="mt-2 flex h-20 items-end justify-around gap-2">
              {(chart.series ?? []).map((datum) => (
                <span key={datum.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] font-semibold text-[#655c55]">{datum.value}</span>
                  <span className="w-full bg-[#e8442e]" style={{ height: `${Math.max((datum.value / maxBar) * 58, 4)}px` }} />
                  <span className="truncate text-[9px] text-[#857b72]">{datum.label}</span>
                </span>
              ))}
            </span>
          </button>
        )}

        {claims.length > 0 && (
          <div className="mt-2.5 space-y-1.5">
            {claims.map((element) => (
              <button
                key={element.id}
                type="button"
                onClick={() => setActive(element)}
                aria-pressed={active?.id === element.id}
                className={`flex w-full items-center justify-between gap-3 border px-3 py-2 text-left transition duration-200 focus:outline-none ${
                  active?.id === element.id ? 'border-[#e8442e] bg-[#f0dfcc]' : 'border-[#141111]/20 bg-[#fff9ef] hover:border-[#e8442e] hover:bg-[#f0dfcc]'
                }`}
              >
                <span className="text-[11px] font-medium leading-4 text-[#141111]">{element.label}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#e8442e]" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section aria-live="polite" aria-label="Evidence detail" className="min-h-[18rem] min-w-0">
        {active ? (
          <div className="h-full border border-[#141111] bg-[#fff9ef] p-4 shadow-[5px_5px_0_rgba(20,17,17,0.12)] sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#b52e20]"><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />Scoped evidence</div>
                <h3 className="mt-1.5 text-base font-bold tracking-[-0.025em] text-[#141111]">{active.evidence.title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#655c55]">{active.evidence.summary}</p>
              </div>
              <button type="button" onClick={() => setActive(null)} aria-label="Close evidence panel" className="p-1.5 text-[#857b72] transition hover:bg-[#f0dfcc] hover:text-[#141111]"><X className="h-4 w-4" aria-hidden="true" /></button>
            </div>
            <div className="mt-3 border border-[#141111]/20 bg-[#f0dfcc] px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b52e20]">Evidence provenance</p>
              <p className="mt-1 font-mono text-[10px] leading-4 text-[#141111] break-words">{active.evidence.provenance.sourceSystem} — {active.evidence.provenance.sourceQuery}</p>
            </div>
            <div className="mt-3"><EvidenceGrid table={active.evidence.table} exportName={`sample-${active.id}`} canExport /></div>
            <ProofDeliveryReceipt element={active} reportTitle={manifest.title} />
            <p className="mt-3 text-[10px] text-[#857b72]">Approved by {active.evidence.provenance.approvedBy} · {active.evidence.provenance.approvedAt.slice(0, 10)} · sample data</p>
          </div>
        ) : (
          <div className="flex min-h-[18rem] h-full flex-col items-center justify-center border border-dashed border-[#141111]/35 bg-[#fff9ef] p-7 text-center">
            <span className="flex h-10 w-10 items-center justify-center bg-[#f0dfcc] text-[#e8442e]"><MouseCue /></span>
            <h3 className="mt-4 text-sm font-bold text-[#141111]">The detail opens in a straight panel.</h3>
            <p className="mt-2 max-w-xs text-xs leading-5 text-[#655c55]">Select any sample figure to inspect its approved rows and provenance below the report on mobile, or beside it on wide screens.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ProofDeliveryReceipt({ element, reportTitle }: { readonly element: ReportElement; readonly reportTitle: string }) {
  return <section aria-label="Sample proof delivery receipt" className="mt-4 overflow-hidden border border-[#141111] bg-[#302b24] p-3 shadow-[3px_3px_0_rgba(20,17,17,0.18)]">
    <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-2 text-[#f8f0df]"><span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em]"><ReceiptText className="h-3.5 w-3.5 text-[#ffb2a3]" aria-hidden="true" /> Proof delivery receipt</span><CheckCircle2 className="h-4 w-4 text-[#9ad6a3]" aria-hidden="true" /></div>
    <div className="mt-3 bg-[#fff9ef] px-3 py-3 font-mono text-[10px] leading-4 text-[#141111] [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_4px),98%_100%,96%_calc(100%_-_4px),94%_100%,92%_calc(100%_-_4px),90%_100%,88%_calc(100%_-_4px),86%_100%,84%_calc(100%_-_4px),82%_100%,80%_calc(100%_-_4px),78%_100%,76%_calc(100%_-_4px),74%_100%,72%_calc(100%_-_4px),70%_100%,68%_calc(100%_-_4px),66%_100%,64%_calc(100%_-_4px),62%_100%,60%_calc(100%_-_4px),58%_100%,56%_calc(100%_-_4px),54%_100%,52%_calc(100%_-_4px),50%_100%,48%_calc(100%_-_4px),46%_100%,44%_calc(100%_-_4px),42%_100%,40%_calc(100%_-_4px),38%_100%,36%_calc(100%_-_4px),34%_100%,32%_calc(100%_-_4px),30%_100%,28%_calc(100%_-_4px),26%_100%,24%_calc(100%_-_4px),22%_100%,20%_calc(100%_-_4px),18%_100%,16%_calc(100%_-_4px),14%_100%,12%_calc(100%_-_4px),10%_100%,8%_calc(100%_-_4px),6%_100%,4%_calc(100%_-_4px),2%_100%,0_calc(100%_-_4px))]"><p className="font-bold">DELIVERY CONFIRMED · SAMPLE</p><p className="mt-2">REPORT: {reportTitle}</p><p>CLAIM: {element.label}</p><p>SCOPE: APPROVED FIXTURE ROWS ONLY</p><p>REVIEW: {element.evidence.provenance.approvedBy}</p><p>READER: DEMONSTRATION BOUNDARY</p><p className="mt-2 border-t border-dashed border-[#141111]/35 pt-2 text-[#655c55]">No recipient data, token, source query, or customer report data is recorded here.</p></div>
  </section>;
}

function MouseCue() {
  return <ArrowRight className="h-3 w-3" aria-hidden="true" />;
}
