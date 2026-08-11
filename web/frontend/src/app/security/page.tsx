import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  DatabaseZap,
  FileCheck2,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  TimerReset,
} from 'lucide-react';
import { getSecurityPosture } from '@/lib/evidence/security-status.ts';

export const dynamic = 'force-dynamic';

interface StatusPillProps {
  readonly ok: boolean;
  readonly label: string;
}

function StatusPill({ ok, label }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        ok ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
      }`}
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </span>
  );
}

export default async function SecurityPage() {
  const posture = await getSecurityPosture();
  const auditVerified = posture.auditLog.verification?.ok === true;
  const auditIssue = posture.auditLog.verification?.ok === false;

  const controls = [
    {
      icon: KeyRound,
      title: 'Recipient-bound signatures',
      status: posture.evidenceSecretConfigured,
      statusLabel: posture.evidenceSecretConfigured ? 'Signing secret configured' : 'Action required',
      body: 'Every evidence URL is HMAC-signed and includes a hash of the intended recipient. A forwarded URL does not become a valid second reader.',
    },
    {
      icon: TimerReset,
      title: 'Expiry and revocation',
      status: true,
      statusLabel: `${posture.revokedTokenCount} revoked token${posture.revokedTokenCount === 1 ? '' : 's'} configured`,
      body: 'Evidence claims carry their own expiry. Token identifiers can be revoked individually without reissuing the report or rotating the signing key.',
    },
    {
      icon: DatabaseZap,
      title: 'Scoped evidence delivery',
      status: true,
      statusLabel: 'Least-data response',
      body: 'A recipient sees only the approved rows behind one requested figure, not a customer-wide data export or a public report portal.',
    },
    {
      icon: FileCheck2,
      title: 'Immutable manifests',
      status: posture.publishedReportCount > 0,
      statusLabel: `${posture.publishedReportCount} validated manifest${posture.publishedReportCount === 1 ? '' : 's'}`,
      body: 'Published reports pass full schema validation before storage. Their evidence, provenance, version, and recipient details are treated as immutable.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Security model
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Trust controls you can inspect
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              RipoDoc is designed to make sensitive reporting evidence least-privilege, time-bound,
              and auditable. This page reports only safe operational state; it never exposes keys,
              recipient identities, or audit records.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Security controls">
          {controls.map((control) => {
            const Icon = control.icon;
            return (
              <article key={control.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <div className="mt-4"><StatusPill ok={control.status} label={control.statusLabel} /></div>
                <h2 className="mt-4 text-base font-semibold text-slate-950">{control.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{control.body}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-violet-600" aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-slate-950">Tamper-evident audit chain</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Audit events are chained using SHA-256 so deletion, reordering, or modification is detectable during verification.
                </p>
              </div>
              <StatusPill
                ok={auditVerified}
                label={auditVerified ? 'Chain verified' : auditIssue ? 'Integrity check failed' : 'Runtime status unavailable'}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Persistence mode</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {posture.auditLog.mode === 'file' ? 'Hash-chained file log' : 'Structured stdout'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verification result</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {auditVerified
                    ? `${posture.auditLog.verification.records} record${posture.auditLog.verification.records === 1 ? '' : 's'} verified`
                    : auditIssue
                      ? `Failed at record ${posture.auditLog.verification.failedAt}`
                      : 'No readable file log in this runtime'}
                </p>
              </div>
            </div>
            <p className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-6 ${auditIssue ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              {posture.auditLog.message}
            </p>
            <div className="mt-5 rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">
              <span className="text-slate-400"># Verify a persisted audit log</span><br />
              npm run audit:verify -- --path /secure/audit/evidence-access.jsonl
            </div>
          </article>

          <aside className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <LockKeyhole className="h-6 w-6 text-blue-700" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">Operator checklist</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li><span className="mr-2 font-semibold text-blue-700">01.</span>Set a 32+ character <code className="rounded bg-white px-1.5 py-0.5 text-xs">RIPODOC_EVIDENCE_SECRET</code>.</li>
              <li><span className="mr-2 font-semibold text-blue-700">02.</span>Send links only to the intended recipient and configure a suitable expiry.</li>
              <li><span className="mr-2 font-semibold text-blue-700">03.</span>Persist stdout logs or configure <code className="rounded bg-white px-1.5 py-0.5 text-xs">RIPODOC_AUDIT_LOG</code> on durable infrastructure.</li>
              <li><span className="mr-2 font-semibold text-blue-700">04.</span>Run the audit verifier as part of operational review.</li>
            </ol>
            <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">
              Open customer workspace <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </section>
      </main>
    </div>
  );
}
