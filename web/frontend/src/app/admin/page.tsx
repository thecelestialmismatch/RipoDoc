import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FileChartColumnIncreasing,
  LockKeyhole,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { ensureCsrfToken, currentSessionUser } from '@/lib/auth/server.ts';
import { getSecurityPosture } from '@/lib/evidence/security-status.ts';
import { listTenantReports } from '@/lib/workspace/reports.ts';

export const dynamic = 'force-dynamic';

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default async function AdminPage() {
  const user = await currentSessionUser();
  if (!user?.emailVerifiedAt || user.disabledAt) redirect('/login');
  if (!['owner', 'admin'].includes(user.role)) redirect('/dashboard');

  const [reports, posture, csrf] = await Promise.all([
    listTenantReports(user.tenantId),
    getSecurityPosture(),
    ensureCsrfToken(),
  ]);
  const evidenceFigures = reports.reduce((total, report) => total + report.elements.length, 0);
  const clientCount = new Set(reports.map((report) => report.client)).size;
  const auditHealthy = posture.auditLog.verification?.ok === true;
  const controls = [
    { label: 'Evidence signing', value: posture.evidenceSecretConfigured ? 'Configured' : 'Needs configuration', healthy: posture.evidenceSecretConfigured },
    { label: 'Audit integrity', value: auditHealthy ? 'Verified' : 'Review required', healthy: auditHealthy },
    { label: 'Evidence exports', value: posture.exportsEnabled ? 'Enabled' : 'Restricted', healthy: true },
    { label: 'Audit storage', value: posture.auditLog.mode === 'file' ? 'File chain' : 'Structured stdout', healthy: posture.auditLog.mode === 'file' },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100">
      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_80%_-20%,rgba(34,211,238,0.16),transparent_30%),#020617]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verified tenant operations
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Private workspace controls</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Signed in as <strong>{user.name}</strong> with the <strong>{user.role}</strong> role. This view is scoped to your MSP tenant and intentionally omits recipient identities, raw audit events, session secrets, and global report data.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3.5 py-2 text-sm font-semibold text-slate-100 hover:border-slate-600 hover:bg-slate-900">
              Open workspace <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <form action="/api/auth/logout" method="post">
              <input type="hidden" name="csrf" value={csrf} />
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3.5 py-2 text-sm font-semibold text-slate-100 hover:border-slate-600 hover:bg-slate-900">
                <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Tenant operations summary">
          <Metric icon={FileChartColumnIncreasing} value={String(reports.length)} label="Tenant reports" color="text-blue-300" />
          <Metric icon={UsersRound} value={String(clientCount)} label="Client organizations" color="text-violet-300" />
          <Metric icon={Activity} value={evidenceFigures.toLocaleString('en-US')} label="Reviewed figures" color="text-emerald-300" />
          <Metric icon={auditHealthy ? CheckCircle2 : ShieldAlert} value={auditHealthy ? 'Verified' : 'Review'} label="Audit-chain status" color={auditHealthy ? 'text-emerald-300' : 'text-amber-300'} />
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-200">Security posture</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Control state without sensitive operational detail.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Use this view to decide what needs operator attention. Detailed evidence and report content stay behind tenant-scoped workflow routes.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {controls.map((control) => <div key={control.label} className="rounded-xl bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">{control.healthy ? <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" /> : <ShieldAlert className="h-4 w-4 text-amber-300" aria-hidden="true" />}{control.label}</div>
                <p className="mt-2 text-sm text-slate-400">{control.value}</p>
              </div>)}
            </div>
            <Link href="/security" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-cyan-100">Review security controls <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </article>
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <LockKeyhole className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-white">Role-bound administration</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">This console requires a verified, individually attributable workspace session with an <strong className="font-semibold text-slate-200">owner</strong> or <strong className="font-semibold text-slate-200">admin</strong> role. Shared access-key sign-in is retired.</p>
            <Link href="/dashboard" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-bold text-slate-950 hover:bg-slate-200">Tenant workspace <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </aside>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Tenant publication registry</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Recently published reports</h2>
              <p className="mt-1 text-sm text-slate-400">This summary exposes report operations only. Recipient addresses and raw evidence rows are intentionally not rendered here.</p>
            </div>
            <Link href="/upload" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-cyan-100">Create reviewed report <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          {reports.length === 0 ? <div className="px-6 py-12 text-sm text-slate-400">No tenant-scoped published reports are available in this deployment.</div> : <ul className="divide-y divide-slate-800">{reports.slice(0, 8).map((report) => <li key={report.reportId} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-semibold text-white">{report.title}</p><p className="mt-1 text-xs text-slate-500">{report.client} · v{report.version} · {report.elements.length} reviewed figures</p></div><p className="shrink-0 text-sm text-slate-400">{formatDate(report.publishedAt)}</p></li>)}</ul>}
        </section>
      </main>
    </div>
  );
}

function Metric({ icon: Icon, value, label, color }: { readonly icon: typeof Activity; readonly value: string; readonly label: string; readonly color: string }) {
  return <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><Icon className={`h-5 w-5 ${color}`} aria-hidden="true" /><p className="mt-4 text-3xl font-bold tracking-tight text-white">{value}</p><p className="mt-1 text-sm text-slate-400">{label}</p></article>;
}
