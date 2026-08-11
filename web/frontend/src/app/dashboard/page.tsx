import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { currentSessionUser } from '@/lib/auth/server.ts';
import { listTenantReports } from '@/lib/workspace/reports.ts';

export const dynamic = 'force-dynamic';

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default async function DashboardPage() {
  const user = await currentSessionUser();
  if (!user) redirect('/login');

  const reports = await listTenantReports(user.tenantId);
  const figures = reports.reduce((total, report) => total + report.elements.length, 0);
  const clients = new Set(reports.map((report) => report.client));
  const newestReport = reports[0];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_90%_-20%,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,#ffffff_0%,#f0f9ff_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-11 lg:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-800">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Verified MSP workspace
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Reports your clients can trust.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Welcome back, {user.name}. Your workspace is isolated to this MSP tenant, and every published report stays linked to its reviewed evidence.
              </p>
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Create a reviewed report
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:py-12">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Workspace summary">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FileCheck2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{reports.length}</p>
            <p className="mt-1 text-sm text-slate-600">Published reports</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UsersRound className="h-5 w-5 text-violet-600" aria-hidden="true" />
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{clients.size}</p>
            <p className="mt-1 text-sm text-slate-600">Client organizations covered</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{figures}</p>
            <p className="mt-1 text-sm text-slate-600">Reviewed evidence figures</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CalendarClock className="h-5 w-5 text-cyan-700" aria-hidden="true" />
            <p className="mt-4 text-lg font-bold tracking-tight text-slate-950">{newestReport ? formatDate(newestReport.publishedAt) : '—'}</p>
            <p className="mt-1 text-sm text-slate-600">Latest publication</p>
          </article>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Publication registry</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">Your defensible reports</h2>
                <p className="mt-1 text-sm text-slate-600">Only manifests owned by this tenant appear here. Download access is authenticated and no-store.</p>
              </div>
              <Link href="/security" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800">
                Security controls <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {reports.length === 0 ? (
              <div className="px-6 py-12">
                <div className="max-w-xl rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
                  <p className="text-sm font-bold text-slate-950">Publish your first evidence-aware report.</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Use the self-hosted authoring flow to attach a validated manifest, review every click zone, and publish a downloadable PDF for your client.</p>
                  <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                    <p><span className="mr-2 font-bold text-cyan-700">01</span>Attach the PDF</p>
                    <p><span className="mr-2 font-bold text-cyan-700">02</span>Approve evidence</p>
                    <p><span className="mr-2 font-bold text-cyan-700">03</span>Publish safely</p>
                  </div>
                  <Link href="/upload" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">
                    Start authoring <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <li key={report.reportId} className="px-6 py-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-bold text-slate-950">{report.title}</p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Published
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{report.client} <span aria-hidden="true">·</span> {report.periodLabel}</p>
                        <p className="mt-1 text-xs text-slate-500">Published {formatDate(report.publishedAt)} <span aria-hidden="true">·</span> {report.elements.length} approved figures <span aria-hidden="true">·</span> v{report.version}</p>
                      </div>
                      <a
                        href={`/api/reports/${encodeURIComponent(report.reportId)}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" /> Manifest
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
              <LockKeyhole className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">Workspace boundary</p>
              <h2 className="mt-2 text-xl font-bold">Your tenant stays separate.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Report queries are scoped to the signed-in MSP tenant. A guessed report identifier does not grant access to another workspace.</p>
              <Link href="/security" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-cyan-100">
                Inspect the controls <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Authenticated profile</p>
              <p className="mt-3 font-bold text-slate-950">{user.name}</p>
              <p className="mt-1 break-all text-sm text-slate-600">{user.email}</p>
              <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <p><strong className="text-slate-950">Role:</strong> {user.role}</p>
                <p className="mt-2"><strong className="text-slate-950">Email:</strong> verified</p>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
