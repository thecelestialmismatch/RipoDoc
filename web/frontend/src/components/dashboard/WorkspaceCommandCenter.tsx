'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Download,
  FileCheck2,
  FileText,
  Filter,
  FolderLock,
  ListFilter,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import type { ReportManifest } from '@/lib/evidence/types.ts';

interface WorkspaceCommandCenterProps {
  readonly user: {
    readonly name: string;
    readonly email: string;
    readonly role: string;
  };
  readonly reports: readonly ReportManifest[];
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

const sourceLabel = (report: ReportManifest): string => report.source?.system ?? 'Reviewed report manifest';

export function WorkspaceCommandCenter({ user, reports }: WorkspaceCommandCenterProps) {
  const [query, setQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(reports[0]?.reportId);

  const clients = useMemo(
    () => [...new Set(reports.map((report) => report.client))].sort((a, b) => a.localeCompare(b)),
    [reports],
  );
  const figures = useMemo(() => reports.reduce((total, report) => total + report.elements.length, 0), [reports]);
  const filteredReports = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesClient = clientFilter === 'all' || report.client === clientFilter;
      const matchesQuery = normalized.length === 0 || [report.title, report.client, report.periodLabel, report.reportId]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
      return matchesClient && matchesQuery;
    });
  }, [clientFilter, query, reports]);
  const selectedReport = reports.find((report) => report.reportId === selectedReportId) ?? filteredReports[0];
  const newestReport = reports[0];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f6f8fc] text-slate-950">
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_82%_-10%,rgba(18,185,190,0.22),transparent_33%),radial-gradient(circle_at_10%_0%,rgba(23,105,232,0.12),transparent_33%),linear-gradient(135deg,#ffffff_0%,#f4f8ff_100%)]">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 lg:py-12">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-800">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Verified tenant workspace
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Evidence operations, without the blind spots.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Welcome back, {user.name}. Track every reviewed client report, inspect its proof coverage, and move the next defensible deliverable forward from one tenant-scoped command center.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/download"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Self-host RipoDoc
              </Link>
              <Link
                href="/upload"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1769E8] to-[#12B9BE] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_26px_-14px_rgba(23,105,232,0.9)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Create reviewed report
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Tenant workspace summary">
          <SummaryMetric icon={FileCheck2} tone="blue" value={reports.length.toString()} label="Published reports" detail="Tenant-scoped registry" />
          <SummaryMetric icon={UsersRound} tone="violet" value={clients.length.toString()} label="Client organizations" detail="Covered by approved evidence" />
          <SummaryMetric icon={ShieldCheck} tone="emerald" value={figures.toString()} label="Reviewed figures" detail="Immutable evidence links" />
          <SummaryMetric icon={CircleDot} tone="cyan" value={newestReport ? formatDate(newestReport.publishedAt) : 'No activity'} label="Latest publication" detail={newestReport ? newestReport.title : 'Start a first report'} compact />
        </section>

        <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(330px,0.58fr)]">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_-24px_rgba(15,23,42,0.35)]">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Evidence registry</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">Find the right client report fast.</h2>
                  <p className="mt-1 text-sm text-slate-600">Search and filter only reports authorized for this workspace. Manifest downloads require your verified session.</p>
                </div>
                <Link href="/security" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800">
                  Review safeguards <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <label className="relative block">
                  <span className="sr-only">Search reports</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search client, report, period, or ID"
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="relative block">
                  <span className="sr-only">Filter by client</span>
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <select
                    value={clientFilter}
                    onChange={(event) => setClientFilter(event.target.value)}
                    className="min-h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-8 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All clients ({clients.length})</option>
                    {clients.map((client) => <option key={client} value={client}>{client}</option>)}
                  </select>
                </label>
              </div>
            </div>

            {reports.length === 0 ? (
              <EmptyRegistry />
            ) : filteredReports.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <ListFilter className="mx-auto h-7 w-7 text-slate-300" aria-hidden="true" />
                <h3 className="mt-4 font-bold text-slate-950">No matching reports.</h3>
                <p className="mt-2 text-sm text-slate-600">Try a different client or remove the search term.</p>
                <button type="button" onClick={() => { setQuery(''); setClientFilter('all'); }} className="mt-5 text-sm font-bold text-blue-700 hover:text-blue-800">
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredReports.map((report) => {
                  const active = selectedReport?.reportId === report.reportId;
                  return (
                    <li key={report.reportId}>
                      <button
                        type="button"
                        onClick={() => setSelectedReportId(report.reportId)}
                        className={`group grid w-full gap-4 px-5 py-5 text-left transition sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 ${active ? 'bg-blue-50/70' : 'hover:bg-slate-50'}`}
                        aria-pressed={active}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-base font-bold text-slate-950">{report.title}</p>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Published
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm text-slate-600">{report.client} <span aria-hidden="true">·</span> {report.periodLabel}</p>
                          <p className="mt-1 text-xs text-slate-500">v{report.version} <span aria-hidden="true">·</span> {report.elements.length} reviewed figures <span aria-hidden="true">·</span> Published {formatDate(report.publishedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                          Inspect <ChevronRight className={`h-4 w-4 transition ${active ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`} aria-hidden="true" />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </article>

          <aside className="space-y-6">
            {selectedReport ? <ReportInspector report={selectedReport} /> : <WorkspaceSetup />}
            <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-[0_16px_38px_-25px_rgba(15,23,42,0.65)]">
              <FolderLock className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">Workspace boundary</p>
              <h2 className="mt-2 text-xl font-bold">One MSP, one defensible view.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Every report in this command center is loaded by tenant ID on the server. A guessed report ID is not an authorization path.</p>
              <div className="mt-5 border-t border-white/10 pt-4 text-sm text-slate-300">
                <p><span className="font-bold text-white">Signed in as:</span> {user.role}</p>
                <p className="mt-1.5 break-all text-xs text-slate-400">{user.email}</p>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

function SummaryMetric({ icon: Icon, tone, value, label, detail, compact = false }: {
  readonly icon: typeof FileCheck2;
  readonly tone: 'blue' | 'violet' | 'emerald' | 'cyan';
  readonly value: string;
  readonly label: string;
  readonly detail: string;
  readonly compact?: boolean;
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    cyan: 'bg-cyan-50 text-cyan-700',
  } as const;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`inline-flex rounded-xl p-2 ${tones[tone]}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
      <p className={`mt-4 font-bold tracking-tight text-slate-950 ${compact ? 'text-lg leading-6' : 'text-3xl'}`}>{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function ReportInspector({ report }: { readonly report: ReportManifest }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Report readiness</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">{report.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{report.client} <span aria-hidden="true">·</span> {report.periodLabel}</p>
      </div>
      <div className="space-y-4 px-6 py-5">
        <ReadinessRow label="Publication state" value="Immutable manifest published" />
        <ReadinessRow label="Evidence coverage" value={`${report.elements.length} approved figure${report.elements.length === 1 ? '' : 's'}`} />
        <ReadinessRow label="Data provenance" value={sourceLabel(report)} />
        <ReadinessRow label="Release version" value={`v${report.version} · ${formatDate(report.publishedAt)}`} />
      </div>
      <div className="grid gap-3 border-t border-slate-100 p-5">
        <a
          href={`/api/reports/${encodeURIComponent(report.reportId)}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
        >
          <Download className="h-4 w-4" aria-hidden="true" /> Download secure manifest
        </a>
        <Link href="/upload" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
          <FileText className="h-4 w-4" aria-hidden="true" /> Create follow-on report
        </Link>
      </div>
    </section>
  );
}

function ReadinessRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 rounded-full bg-emerald-50 p-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /></span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.11em] text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function EmptyRegistry() {
  return (
    <div className="px-6 py-14">
      <div className="max-w-xl rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <FileText className="h-6 w-6 text-cyan-700" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-bold text-slate-950">Publish your first evidence-aware report.</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Attach the client PDF, review every click zone, record the approval, and publish a report whose evidence can be verified without exposing a data export.</p>
        <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
          <p><span className="mr-2 font-bold text-cyan-700">01</span>Attach</p>
          <p><span className="mr-2 font-bold text-cyan-700">02</span>Approve</p>
          <p><span className="mr-2 font-bold text-cyan-700">03</span>Publish</p>
        </div>
        <Link href="/upload" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
          Start authoring <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function WorkspaceSetup() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">First report plan</p>
      <h2 className="mt-2 text-xl font-bold text-slate-950">Your operations view will grow from published evidence.</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">Create one reviewed report to activate the registry, report inspector, client filtering, and evidence-readiness workflow.</p>
      <Link href="/upload" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800">
        Open authoring studio <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
