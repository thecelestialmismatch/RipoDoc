'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  FolderLock,
  ListFilter,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { EvidenceDeliveryReceipt } from '@/components/dashboard/EvidenceDeliveryReceipt.tsx';
import { assessProofOperations, createEvidenceDeliveryReceipt, type ProofOperationsSnapshot, type ReportAuditSummary } from '@/lib/evidence/operations.ts';
import type { ReportManifest } from '@/lib/evidence/types.ts';

interface WorkspaceCommandCenterProps {
  readonly user: { readonly name: string; readonly email: string; readonly role: string };
  readonly reports: readonly ReportManifest[];
  /** Derived server-side from reports already scoped to the authenticated tenant. */
  readonly auditByReport: Readonly<Record<string, ReportAuditSummary>>;
}

const formatDate = (value: string): string => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const unavailableAudit: ReportAuditSummary = { status: 'unavailable', granted: 0, denied: 0 };

export function WorkspaceCommandCenter({ user, reports, auditByReport }: WorkspaceCommandCenterProps) {
  const [query, setQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(reports[0]?.reportId);
  const clients = useMemo(() => [...new Set(reports.map((report) => report.client))].sort((a, b) => a.localeCompare(b)), [reports]);
  const snapshots = useMemo(() => Object.fromEntries(reports.map((report) => [report.reportId, assessProofOperations(report)])), [reports]);
  const reviewedFigures = useMemo(() => reports.reduce((total, report) => total + report.elements.length, 0), [reports]);
  const readyReports = useMemo(() => Object.values(snapshots).filter((snapshot) => snapshot.state === 'ready').length, [snapshots]);
  const provenanceComplete = useMemo(() => Object.values(snapshots).reduce((total, snapshot) => total + snapshot.reviewedWithCompleteProvenance, 0), [snapshots]);
  const deliveryEvents = useMemo(() => Object.values(auditByReport).reduce((total, summary) => total + summary.granted + summary.denied, 0), [auditByReport]);
  const durableAudit = Object.values(auditByReport).some((summary) => summary.status === 'durable');
  const filteredReports = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reports.filter((report) => (clientFilter === 'all' || report.client === clientFilter)
      && (normalized.length === 0 || [report.title, report.client, report.periodLabel, report.reportId].join(' ').toLowerCase().includes(normalized)));
  }, [clientFilter, query, reports]);
  const selectedReport = reports.find((report) => report.reportId === selectedReportId) ?? filteredReports[0];
  const selectedSnapshot = selectedReport ? snapshots[selectedReport.reportId] : undefined;
  const selectedAudit = selectedReport ? (auditByReport[selectedReport.reportId] ?? unavailableAudit) : unavailableAudit;
  const newestReport = reports[0];

  return <div className="min-h-[calc(100vh-76px)] bg-[#f8f0df] text-[#141111]">
    <section className="relative overflow-hidden border-b border-[#141111] bg-[#e8442e] text-[#f8f0df]">
      <div className="pointer-events-none absolute -top-12 right-0 text-[13rem] font-black leading-none tracking-[-0.15em] text-transparent [-webkit-text-stroke:1px_rgba(248,240,223,0.45)]" aria-hidden="true">ACT IV</div>
      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="stage-kicker text-[#ffb2a3]">Act IV / proof operations</p>
            <h1 className="stage-display mt-4 text-5xl sm:text-6xl">Run the scene behind every report claim.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#f8f0df]/88">Welcome back, {user.name}. This tenant-scoped console makes the declared source, reviewer, recipient binding, and delivery activity around each published report visible—without turning your report into a broad data portal.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/download" className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#f8f0df] px-4 py-2.5 text-sm font-bold text-[#f8f0df] transition hover:bg-[#141111]"><Download className="h-4 w-4" aria-hidden="true" /> Self-host RipoDoc</Link>
            <Link href="/upload" className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#141111] px-5 py-2.5 text-sm font-bold text-[#f8f0df] transition hover:bg-[#2a2421]"><Sparkles className="h-4 w-4" aria-hidden="true" /> Create reviewed report</Link>
          </div>
        </div>
      </div>
    </section>

    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="grid gap-px border border-[#141111] bg-[#141111] sm:grid-cols-2 xl:grid-cols-4" aria-label="Proof operations summary">
        <SummaryMetric icon={BadgeCheck} tone="red" value={`${readyReports}/${reports.length}`} label="Proof-ready reports" detail="Declared delivery facts complete" />
        <SummaryMetric icon={FileCheck2} tone="cream" value={`${provenanceComplete}/${reviewedFigures}`} label="Approved figures" detail="With complete provenance" />
        <SummaryMetric icon={Eye} tone="ink" value={durableAudit ? deliveryEvents.toString() : '—'} label="Delivery events" detail={durableAudit ? 'Durable audit summaries' : 'Durable audit not configured'} />
        <SummaryMetric icon={CircleDot} tone="pink" value={newestReport ? formatDate(newestReport.publishedAt) : 'No activity'} label="Latest publication" detail={newestReport ? newestReport.title : 'Start a first report'} compact />
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(330px,0.58fr)]">
        <article className="overflow-hidden border border-[#141111] bg-[#fff9ef]">
          <div className="border-b border-[#141111]/20 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="stage-kicker text-[#b52e20]">The report registry</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.05em]">Find the right client report fast.</h2>
                <p className="mt-2 text-sm text-[#655c55]">Search only reports authorized for this workspace. The operations view summarizes declared manifest facts; it is not a compliance determination.</p>
              </div>
              <Link href="/security" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#b52e20] hover:text-[#141111]">Review safeguards <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="relative block"><span className="sr-only">Search reports</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#857b72]" aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search client, report, period, or ID" className="min-h-11 w-full border border-[#141111]/35 bg-[#fff9ef] py-2 pl-10 pr-3 text-sm text-[#141111] outline-none transition placeholder:text-[#857b72] focus:border-[#e8442e] focus:ring-2 focus:ring-[#e8442e]/15" /></label>
              <label className="relative block"><span className="sr-only">Filter by client</span><Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#857b72]" aria-hidden="true" /><select value={clientFilter} onChange={(event) => setClientFilter(event.target.value)} className="min-h-11 w-full appearance-none border border-[#141111]/35 bg-[#fff9ef] py-2 pl-10 pr-8 text-sm font-medium text-[#141111] outline-none transition focus:border-[#e8442e] focus:ring-2 focus:ring-[#e8442e]/15"><option value="all">All clients ({clients.length})</option>{clients.map((client) => <option key={client} value={client}>{client}</option>)}</select></label>
            </div>
          </div>
          {reports.length === 0 ? <EmptyRegistry /> : filteredReports.length === 0 ? <NoMatchingReports onClear={() => { setQuery(''); setClientFilter('all'); }} /> : <ul className="divide-y divide-[#141111]/15">{filteredReports.map((report) => {
            const active = selectedReport?.reportId === report.reportId;
            const snapshot = snapshots[report.reportId];
            return <li key={report.reportId}><button type="button" onClick={() => setSelectedReportId(report.reportId)} className={`group grid w-full gap-4 px-5 py-5 text-left transition sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 ${active ? 'bg-[#f0dfcc]' : 'hover:bg-[#f7ecdc]'}`} aria-pressed={active}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><p className="truncate text-base font-bold">{report.title}</p><span className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold ${snapshot.state === 'ready' ? 'bg-[#d9f0dc] text-[#1f6146]' : 'bg-[#ffe2b8] text-[#8c3d00]'}`}><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> {snapshot.state === 'ready' ? 'Proof-ready' : 'Needs attention'}</span></div>
                <p className="mt-1.5 text-sm text-[#655c55]">{report.client} <span aria-hidden="true">·</span> {report.periodLabel}</p>
                <p className="mt-1 text-xs text-[#857b72]">v{report.version} <span aria-hidden="true">·</span> {snapshot.evidenceCoveragePercent}% provenance coverage <span aria-hidden="true">·</span> Published {formatDate(report.publishedAt)}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#b52e20]">Inspect <ChevronRight className={`h-4 w-4 transition ${active ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`} aria-hidden="true" /></div>
            </button></li>;
          })}</ul>}
        </article>
        <aside className="space-y-6">{selectedReport && selectedSnapshot ? <ProofOperationsInspector key={selectedReport.reportId} report={selectedReport} snapshot={selectedSnapshot} audit={selectedAudit} /> : <WorkspaceSetup />}<WorkspaceBoundary user={user} /></aside>
      </section>
    </main>
  </div>;
}

function SummaryMetric({ icon: Icon, tone, value, label, detail, compact = false }: { readonly icon: LucideIcon; readonly tone: 'red' | 'cream' | 'ink' | 'pink'; readonly value: string; readonly label: string; readonly detail: string; readonly compact?: boolean }) {
  const tones = { red: 'bg-[#e8442e] text-[#f8f0df]', cream: 'bg-[#fff9ef] text-[#141111]', ink: 'bg-[#141111] text-[#f8f0df]', pink: 'bg-[#ff9b88] text-[#141111]' } as const;
  return <article className={`p-5 ${tones[tone]}`}><span className="inline-flex border border-current p-2"><Icon className="h-4 w-4" aria-hidden="true" /></span><p className={`mt-4 font-extrabold tracking-[-0.06em] ${compact ? 'text-lg leading-6' : 'text-3xl'}`}>{value}</p><p className="mt-1 text-sm font-medium">{label}</p><p className="mt-1 text-xs opacity-65">{detail}</p></article>;
}

function ProofOperationsInspector({ report, snapshot, audit }: { readonly report: ReportManifest; readonly snapshot: ProofOperationsSnapshot; readonly audit: ReportAuditSummary }) {
  const [receiptElementId, setReceiptElementId] = useState<string | undefined>(report.elements[0]?.id);
  const receipt = createEvidenceDeliveryReceipt({ report, snapshot, audit, elementId: receiptElementId });

  return <section className="overflow-hidden border border-[#141111] bg-[#fff9ef]">
    <div className="border-b border-[#141111]/15 px-6 py-5"><p className="stage-kicker text-[#b52e20]">Proof operations</p><h2 className="mt-2 text-xl font-bold">{report.title}</h2><p className="mt-1 text-sm text-[#655c55]">{report.client} <span aria-hidden="true">·</span> {report.periodLabel}</p></div>
    <div className="space-y-5 px-6 py-5">
      <div className={`border p-4 ${snapshot.state === 'ready' ? 'border-[#1f6146]/25 bg-[#d9f0dc]' : 'border-[#8c3d00]/25 bg-[#ffe2b8]'}`}><div className="flex items-center gap-2"><BadgeCheck className={`h-4 w-4 ${snapshot.state === 'ready' ? 'text-[#1f6146]' : 'text-[#8c3d00]'}`} aria-hidden="true" /><p className="text-sm font-bold">{snapshot.state === 'ready' ? 'Ready for a controlled evidence handoff' : 'Resolve declared delivery gaps'}</p></div><p className="mt-2 text-xs leading-5">This assessment checks the published manifest only. It does not certify source accuracy, compliance, or recipient behavior after viewing.</p></div>
      <dl className="space-y-4">{snapshot.coverage.map((item) => <ReadinessRow key={item.label} label={item.label} value={item.detail} state={item.state} />)}</dl>
      {report.elements.length > 1 ? <label className="block border-t border-[#141111]/15 pt-5"><span className="text-xs font-bold uppercase tracking-[0.11em] text-[#857b72]">Receipt claim reference</span><select value={receiptElementId} onChange={(event) => setReceiptElementId(event.target.value)} className="mt-2 min-h-11 w-full border border-[#141111]/35 bg-[#fff9ef] px-3 py-2 text-sm font-semibold text-[#141111] outline-none focus:border-[#e8442e] focus:ring-2 focus:ring-[#e8442e]/15">{report.elements.map((element) => <option key={element.id} value={element.id}>{element.label} · {element.id}</option>)}</select></label> : null}
      <EvidenceDeliveryReceipt receipt={receipt} />
    </div>
    <div className="grid gap-3 border-t border-[#141111]/15 p-5"><a href={`/api/reports/${encodeURIComponent(report.reportId)}`} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#141111] px-4 py-2.5 text-sm font-bold text-[#f8f0df] transition hover:bg-[#e8442e]"><Download className="h-4 w-4" aria-hidden="true" /> Download secure manifest</a><Link href="/upload" className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#141111]/35 px-4 py-2.5 text-sm font-bold text-[#141111] transition hover:bg-[#f0dfcc]"><FileText className="h-4 w-4" aria-hidden="true" /> Create follow-on report</Link></div>
  </section>;
}

function ReadinessRow({ label, value, state }: { readonly label: string; readonly value: string; readonly state: 'ready' | 'attention' }) { return <div className="flex items-start gap-3"><span className={`mt-0.5 p-1 ${state === 'ready' ? 'bg-[#d9f0dc] text-[#1f6146]' : 'bg-[#ffe2b8] text-[#8c3d00]'}`}><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /></span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.11em] text-[#857b72]">{label}</p><p className="mt-1 break-words text-sm font-semibold leading-5">{value}</p></div></div>; }
function NoMatchingReports({ onClear }: { readonly onClear: () => void }) { return <div className="px-6 py-16 text-center"><ListFilter className="mx-auto h-7 w-7 text-[#cdbdab]" aria-hidden="true" /><h3 className="mt-4 font-bold">No matching reports.</h3><p className="mt-2 text-sm text-[#655c55]">Try a different client or remove the search term.</p><button type="button" onClick={onClear} className="mt-5 text-sm font-bold text-[#b52e20] hover:text-[#141111]">Clear filters</button></div>; }
function EmptyRegistry() { return <div className="px-6 py-14"><div className="max-w-xl border border-dashed border-[#cdbdab] bg-[#f7ecdc] p-6"><FileText className="h-6 w-6 text-[#b52e20]" aria-hidden="true" /><h3 className="mt-4 text-lg font-bold">Publish your first evidence-aware report.</h3><p className="mt-2 text-sm leading-6 text-[#655c55]">Attach the client PDF, review every click zone, record the approval, and publish a report whose evidence can be verified without exposing a data export.</p><div className="mt-5 grid gap-3 text-sm text-[#141111] sm:grid-cols-3"><p><span className="mr-2 font-bold text-[#b52e20]">I</span>Attach</p><p><span className="mr-2 font-bold text-[#b52e20]">II</span>Approve</p><p><span className="mr-2 font-bold text-[#b52e20]">III</span>Publish</p></div><Link href="/upload" className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#141111] px-4 py-2.5 text-sm font-bold text-[#f8f0df] transition hover:bg-[#e8442e]">Start authoring <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>; }
function WorkspaceSetup() { return <section className="border border-[#141111] bg-[#fff9ef] p-6"><p className="stage-kicker text-[#b52e20]">First report plan</p><h2 className="mt-3 text-xl font-bold">Your operations view will grow from published evidence.</h2><p className="mt-3 text-sm leading-6 text-[#655c55]">Create one reviewed report to activate the registry, proof coverage, delivery posture, and audit-summary workflow.</p><Link href="/upload" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#b52e20] hover:text-[#141111]">Open authoring studio <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></section>; }
function WorkspaceBoundary({ user }: { readonly user: WorkspaceCommandCenterProps['user'] }) { return <section className="bg-[#141111] p-6 text-[#f8f0df]"><FolderLock className="h-5 w-5 text-[#ff9b88]" aria-hidden="true" /><p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#ff9b88]">Workspace boundary</p><h2 className="mt-2 text-xl font-bold">One MSP, one defensible view.</h2><p className="mt-3 text-sm leading-6 text-[#f8f0df]/72">Every report and audit summary in this console is selected by tenant ID on the server. A guessed report ID is not an authorization path.</p><div className="mt-5 border-t border-[#f8f0df]/15 pt-4 text-sm text-[#f8f0df]/70"><p><span className="font-bold text-[#f8f0df]">Signed in as:</span> {user.role}</p><p className="mt-1.5 break-all text-xs text-[#f8f0df]/50">{user.email}</p></div></section>; }
