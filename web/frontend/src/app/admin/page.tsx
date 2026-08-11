import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FileChartColumnIncreasing,
  LogOut,
  Mail,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { isAdminSession } from '@/lib/admin/server-session.ts';
import { getSecurityPosture } from '@/lib/evidence/security-status.ts';
import { listPublishedManifests } from '@/lib/evidence/store.ts';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default async function AdminPage() {
  if (!(await isAdminSession())) redirect('/admin/login');

  const [reports, posture] = await Promise.all([listPublishedManifests(), getSecurityPosture()]);
  const recipients = Array.from(
    new Map(reports.map((report) => [report.recipient.email, report.recipient])).values(),
  );
  const evidenceRows = reports.reduce(
    (total, report) => total + report.elements.reduce((sum, element) => sum + element.evidence.table.rows.length, 0),
    0,
  );
  const auditHealthy = posture.auditLog.verification?.ok === true;
  const latestReports = reports.slice(0, 3);
  const controlIssues = [
    !posture.evidenceSecretConfigured ? 'Evidence signing needs configuration' : null,
    !auditHealthy ? 'Audit-chain verification needs review' : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100">
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-200">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Administrator workspace
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">RipoDoc operations console</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Private operational visibility for published reports, registered recipients, and evidence-control health.
            </p>
          </div>
          <form action="/api/admin/session" method="post">
            <input type="hidden" name="_method" value="delete" />
            <button
              formAction="/api/admin/session"
              formMethod="post"
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3.5 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-900"
              aria-label="Sign out of administrator workspace"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Operations summary">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <FileChartColumnIncreasing className="h-5 w-5 text-blue-300" aria-hidden="true" />
            <p className="mt-4 text-3xl font-bold tracking-tight text-white">{reports.length}</p>
            <p className="mt-1 text-sm text-slate-400">Published reports</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <UsersRound className="h-5 w-5 text-violet-300" aria-hidden="true" />
            <p className="mt-4 text-3xl font-bold tracking-tight text-white">{recipients.length}</p>
            <p className="mt-1 text-sm text-slate-400">Recipient records</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Activity className="h-5 w-5 text-emerald-300" aria-hidden="true" />
            <p className="mt-4 text-3xl font-bold tracking-tight text-white">{evidenceRows.toLocaleString('en-US')}</p>
            <p className="mt-1 text-sm text-slate-400">Approved evidence rows</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            {auditHealthy ? <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" /> : <ShieldAlert className="h-5 w-5 text-amber-300" aria-hidden="true" />}
            <p className="mt-4 text-3xl font-bold tracking-tight text-white">{auditHealthy ? 'Healthy' : 'Review'}</p>
            <p className="mt-1 text-sm text-slate-400">Audit-chain status</p>
          </article>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]" aria-label="Operator command strip">
          <article className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200">Operator attention</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{controlIssues.length === 0 ? 'All reported controls are operational.' : 'Review the outstanding operational controls.'}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">This summary intentionally reports safe deployment posture only. It does not disclose recipient identities, signing secrets, raw audit events, or authentication credentials.</p>
              </div>
              <Link href="/security" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-cyan-300 px-3.5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">
                Review controls <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {(controlIssues.length ? controlIssues : ['Evidence signing is configured', 'Audit-chain verification is healthy']).map((item) => (
                <li key={item} className="flex items-center gap-3 rounded-xl bg-slate-950/55 px-4 py-3 text-sm text-slate-200">
                  {controlIssues.length ? <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />}
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Latest publication activity</p>
            {latestReports.length > 0 ? <ul className="mt-4 space-y-3">{latestReports.map((report) => (
              <li key={report.reportId} className="border-l-2 border-cyan-300/70 pl-3">
                <p className="truncate text-sm font-medium text-white">{report.title}</p>
                <p className="mt-1 text-xs text-slate-500">Published {formatDate(report.publishedAt)} · {report.elements.length} figures</p>
              </li>
            ))}</ul> : <p className="mt-4 text-sm leading-6 text-slate-400">No validated report activity is available in this deployment.</p>}
          </aside>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Published report registry</h2>
                <p className="mt-1 text-sm text-slate-400">Published manifests are immutable. Use the customer workspace for safe distribution actions.</p>
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200">
                Open workspace <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Report</th>
                    <th className="px-6 py-3 font-semibold">Client</th>
                    <th className="px-6 py-3 font-semibold">Recipient</th>
                    <th className="px-6 py-3 font-semibold">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reports.length > 0 ? reports.map((report) => (
                    <tr key={report.reportId} className="text-slate-300">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{report.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{report.reportId} · v{report.version}</p>
                      </td>
                      <td className="px-6 py-4">{report.client}</td>
                      <td className="px-6 py-4">{report.recipient.email}</td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(report.publishedAt)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">No validated manifests are available in this deployment.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <Mail className="h-5 w-5 text-blue-300" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-white">Recipient directory</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Recipients are drawn from published manifests. This view is restricted to administrators.</p>
            <ul className="mt-5 divide-y divide-slate-800">
              {recipients.length > 0 ? recipients.map((recipient) => (
                <li key={recipient.email} className="py-3 first:pt-0">
                  <p className="text-sm font-medium text-slate-200">{recipient.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{recipient.email}</p>
                </li>
              )) : <li className="py-3 text-sm text-slate-400">No recipient records yet.</li>}
            </ul>
          </aside>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">System controls</h2>
              <p className="mt-1 text-sm text-slate-400">A no-secret operational summary for the production deployment.</p>
            </div>
            <Link href="/security" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200">
              View security model <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-950/60 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evidence signing</dt><dd className="mt-2 text-sm font-semibold text-slate-100">{posture.evidenceSecretConfigured ? 'Configured' : 'Missing'}</dd></div>
            <div className="rounded-xl bg-slate-950/60 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Link revocations</dt><dd className="mt-2 text-sm font-semibold text-slate-100">{posture.revokedTokenCount} configured</dd></div>
            <div className="rounded-xl bg-slate-950/60 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Row exports</dt><dd className="mt-2 text-sm font-semibold text-slate-100">{posture.exportsEnabled ? 'Allowed' : 'Disabled'}</dd></div>
            <div className="rounded-xl bg-slate-950/60 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Audit persistence</dt><dd className="mt-2 text-sm font-semibold text-slate-100">{posture.auditLog.mode === 'file' ? 'File chain' : 'Structured stdout'}</dd></div>
          </dl>
        </section>
      </main>
    </div>
  );
}
