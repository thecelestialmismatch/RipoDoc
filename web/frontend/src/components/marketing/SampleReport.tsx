'use client';

import { useState } from 'react';
import { ArrowRight, FileText, LockKeyhole, X } from 'lucide-react';
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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section aria-label="Sample report figures" className="rounded-2xl border border-slate-200 bg-[#F6F8FC] p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#087E84]"><FileText className="h-3.5 w-3.5" aria-hidden="true" />{manifest.provider}</div>
            <h3 className="mt-1 text-base font-bold tracking-[-0.025em] text-[#11162E]">{manifest.title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{manifest.client} · {manifest.periodLabel}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200"><MouseCue />Click a figure</span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {kpis.map((element) => (
            <button
              key={element.id}
              type="button"
              onClick={() => setActive(element)}
              aria-pressed={active?.id === element.id}
              className={`rounded-xl border p-2.5 text-left transition duration-200 focus:outline-none ${
                active?.id === element.id ? 'border-[#12B9BE] bg-[#DDF9F7] shadow-sm' : 'border-slate-200 bg-white hover:border-[#1769E8]/40 hover:bg-[#EAF5FF]'
              }`}
            >
              <span className="block text-lg font-bold tracking-[-0.05em] text-[#11162E]">{element.value}</span>
              <span className="mt-1 block text-[10px] leading-4 text-slate-600">{element.label}</span>
            </button>
          ))}
        </div>

        {chart && (
          <button
            type="button"
            onClick={() => setActive(chart)}
            aria-pressed={active?.id === chart.id}
            className={`mt-2.5 w-full rounded-xl border p-3 text-left transition duration-200 focus:outline-none ${
              active?.id === chart.id ? 'border-[#12B9BE] bg-[#DDF9F7] shadow-sm' : 'border-slate-200 bg-white hover:border-[#1769E8]/40 hover:bg-[#EAF5FF]'
            }`}
          >
            <span className="text-xs font-semibold text-[#11162E]">{chart.label}</span>
            <span className="mt-2 flex h-20 items-end justify-around gap-2">
              {(chart.series ?? []).map((datum) => (
                <span key={datum.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] font-semibold text-slate-600">{datum.value}</span>
                  <span className="w-full rounded-t-md bg-gradient-to-t from-[#1769E8] to-[#12B9BE]" style={{ height: `${Math.max((datum.value / maxBar) * 58, 4)}px` }} />
                  <span className="truncate text-[9px] text-slate-500">{datum.label}</span>
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
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition duration-200 focus:outline-none ${
                  active?.id === element.id ? 'border-[#12B9BE] bg-[#DDF9F7]' : 'border-slate-200 bg-white hover:border-[#1769E8]/40 hover:bg-[#EAF5FF]'
                }`}
              >
                <span className="text-[11px] font-medium leading-4 text-[#11162E]">{element.label}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#1769E8]" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section aria-live="polite" aria-label="Evidence detail" className="min-h-[18rem]">
        {active ? (
          <div className="h-full rounded-2xl border border-[#1769E8]/15 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#087E84]"><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />Scoped evidence</div>
                <h3 className="mt-1.5 text-base font-bold tracking-[-0.025em] text-[#11162E]">{active.evidence.title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">{active.evidence.summary}</p>
              </div>
              <button type="button" onClick={() => setActive(null)} aria-label="Close evidence panel" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" aria-hidden="true" /></button>
            </div>
            <div className="mt-3 rounded-xl border border-[#1769E8]/10 bg-[#EAF5FF] px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0A3E9B]">Evidence provenance</p>
              <p className="mt-1 font-mono text-[10px] leading-4 text-[#11162E] break-words">{active.evidence.provenance.sourceSystem} — {active.evidence.provenance.sourceQuery}</p>
            </div>
            <div className="mt-3"><EvidenceGrid table={active.evidence.table} exportName={`sample-${active.id}`} canExport /></div>
            <p className="mt-3 text-[10px] text-slate-500">Approved by {active.evidence.provenance.approvedBy} · {active.evidence.provenance.approvedAt.slice(0, 10)} · sample data</p>
          </div>
        ) : (
          <div className="flex min-h-[18rem] h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1769E8]"><MouseCue /></span>
            <h3 className="mt-4 text-sm font-bold text-[#11162E]">The detail opens beside the report.</h3>
            <p className="mt-2 max-w-xs text-xs leading-5 text-slate-600">Select any sample figure to inspect its approved rows and provenance — the same interaction your recipient gets from the PDF.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function MouseCue() {
  return <ArrowRight className="h-3 w-3" aria-hidden="true" />;
}
