'use client';

import { useState } from 'react';
import { ArrowRight, FileText, X } from 'lucide-react';
import { EvidenceGrid } from '@/components/evidence/EvidenceGrid.tsx';
import type { ReportElement, ReportManifest } from '@/lib/evidence/types.ts';

/**
 * An in-page replica of the real interaction, for the marketing site.
 *
 * It uses the same `EvidenceGrid` a recipient sees, driven by the same sample
 * manifest the PDF generator consumes — so the demo cannot drift away from the
 * product. It is deliberately **not** token-gated: this is sample data, and
 * requiring a signed link to view a public demo would be theatre.
 */
export function SampleReport({ manifest }: { manifest: ReportManifest }) {
  const [active, setActive] = useState<ReportElement | null>(null);

  const kpis = manifest.elements.filter((element) => element.kind === 'kpi');
  const chart = manifest.elements.find((element) => element.kind === 'bar-chart');
  const claims = manifest.elements.filter((element) => element.kind === 'claim');
  const maxBar = Math.max(...(chart?.series ?? []).map((datum) => datum.value), 1);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* The page as it appears in the PDF. */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
          <FileText aria-hidden="true" className="h-3.5 w-3.5" />
          {manifest.provider}
        </div>
        <h3 className="mt-1 text-xl font-bold text-slate-900">{manifest.title}</h3>
        <p className="text-sm text-slate-500">
          {manifest.client} · {manifest.periodLabel}
        </p>

        <p className="mt-4 rounded bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Every figure below is clickable — exactly as it behaves in the PDF.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {kpis.map((element) => (
            <button
              key={element.id}
              type="button"
              onClick={() => setActive(element)}
              aria-pressed={active?.id === element.id}
              className={`rounded-lg border-t-2 border-blue-600 bg-slate-50 p-3 text-left transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                active?.id === element.id ? 'bg-blue-50 ring-2 ring-blue-200' : ''
              }`}
            >
              <span className="block text-2xl font-bold tracking-tight text-slate-900">
                {element.value}
              </span>
              <span className="mt-1 block text-xs text-slate-600">{element.label}</span>
            </button>
          ))}
        </div>

        {chart ? (
          <button
            type="button"
            onClick={() => setActive(chart)}
            className={`mt-3 w-full rounded-lg bg-slate-50 p-4 text-left transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              active?.id === chart.id ? 'bg-blue-50 ring-2 ring-blue-200' : ''
            }`}
          >
            <span className="text-sm font-semibold text-slate-900">{chart.label}</span>
            <span className="mt-3 flex h-24 items-end justify-around gap-3">
              {(chart.series ?? []).map((datum) => (
                <span key={datum.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-700">{datum.value}</span>
                  <span
                    className="w-full rounded-t bg-blue-600"
                    style={{ height: `${Math.max((datum.value / maxBar) * 72, 4)}px` }}
                  />
                  <span className="text-[10px] text-slate-500">{datum.label}</span>
                </span>
              ))}
            </span>
          </button>
        ) : null}

        <div className="mt-3 space-y-2">
          {claims.map((element) => (
            <button
              key={element.id}
              type="button"
              onClick={() => setActive(element)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border-l-2 border-blue-600 bg-slate-50 p-3 text-left transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                active?.id === element.id ? 'bg-blue-50 ring-2 ring-blue-200' : ''
              }`}
            >
              <span className="text-xs font-medium text-slate-800">{element.label}</span>
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            </button>
          ))}
        </div>
      </div>

      {/* What opens when the reader clicks. */}
      <div aria-live="polite">
        {active ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{active.evidence.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{active.evidence.summary}</p>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close evidence panel"
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 rounded bg-blue-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-800">
                How this figure was calculated
              </p>
              <p className="mt-0.5 font-mono text-[11px] break-words text-blue-900">
                {active.evidence.provenance.sourceSystem} — {active.evidence.provenance.sourceQuery}
              </p>
            </div>

            <div className="mt-3">
              <EvidenceGrid
                table={active.evidence.table}
                exportName={`sample-${active.id}`}
                canExport
              />
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              Approved by {active.evidence.provenance.approvedBy} ·{' '}
              {active.evidence.provenance.approvedAt.slice(0, 10)} · sample data
            </p>
          </div>
        ) : (
          <div className="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <ArrowRight aria-hidden="true" className="h-6 w-6 text-slate-400" />
            <p className="mt-3 max-w-xs text-sm text-slate-600">
              Click any figure in the report on the left. The exact rows behind it open here —
              the same thing that happens when a client clicks the PDF.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
