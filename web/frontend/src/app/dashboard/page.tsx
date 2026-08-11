import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  FolderOpen,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { listPublishedManifests } from '@/lib/evidence/store.ts';

export const dynamic = 'force-dynamic';

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const evidenceRowCount = (elements: Awaited<ReturnType<typeof listPublishedManifests>>[number]['elements']): number =>
  elements.reduce((total, element) => total + element.evidence.table.rows.length, 0);

export default async function DashboardPage() {
  const reports = await listPublishedManifests();
  const reportCount = reports.length;
  const elementCount = reports.reduce((total, report) => total + report.elements.length, 0);
  const sourceCount = new Set(reports.map((report) => report.source?.system ?? 'Declared source')).size;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                Customer workspace
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
                Reports your customers can trust
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Review published report metadata, inspect provenance, and distribute a downloadable
                PDF without changing your existing reporting stack.
              </p>
            </div>
            <Link
              href="/upload"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Create a report
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FolderOpen className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{reportCount}</p>
            <p className="mt-1 text-sm text-slate-600">Published report{reportCount === 1 ? '' : 's'}</p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Gauge className="h-5 w-5 text-violet-600" aria-hidden="true" />
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{elementCount}</p>
            <p className="mt-1 text-sm text-slate-600">Verified report figures</p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">100%</p>
            <p className="mt-1 text-sm text-slate-600">Human-approved evidence</p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <LockKeyhole className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{sourceCount}</p>
            <p className="mt-1 text-sm text-slate-600">Declared data source{sourceCount === 1 ? '' : 's'}</p>
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Published reports</h2>
              <p className="mt-1 text-sm text-slate-600">
                These records are validated against RipoDoc&apos;s immutable report-manifest contract.
              </p>
            </div>
            <Link
              href="/security"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Review security controls <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No published reports yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Upload a PDF to begin the review-and-publish workflow. Published reports will appear
                here when their manifests have passed validation.
              </p>
              <Link
                href="/upload"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Upload a PDF <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {reports.map((report) => {
                const rows = evidenceRowCount(report.elements);
                const bundledPdf = report.reportId === 'rpt-demo-0001';
                return (
                  <li key={report.reportId} className="px-6 py-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Published · v{report.version}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                            {formatDate(report.publishedAt)}
                          </span>
                        </div>
                        <h3 className="mt-3 truncate text-base font-semibold text-slate-950">{report.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {report.client} · {report.periodLabel} · {report.provider}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {report.elements.length} clickable figure{report.elements.length === 1 ? '' : 's'} · {rows.toLocaleString('en-US')} approved evidence row{rows === 1 ? '' : 's'} · Recipient: {report.recipient.email}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-3">
                        <a
                          href={`/api/reports/${encodeURIComponent(report.reportId)}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Manifest
                        </a>
                        {bundledPdf ? (
                          <a
                            href={`/reports/${encodeURIComponent(report.reportId)}.pdf`}
                            download
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            Download PDF
                          </a>
                        ) : (
                          <Link
                            href="/upload"
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                          >
                            Publish PDF <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
