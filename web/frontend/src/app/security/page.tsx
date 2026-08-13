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

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="hosted-readiness-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#087E84]">Hosted production readiness</p><h2 id="hosted-readiness-heading" className="mt-1 text-xl font-semibold text-slate-950">A deployment should earn the right to collect customer data.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">These flags report configuration state only. The release gate still requires authenticated checks, database schema verification, and private-worker reachability through <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">npm run preflight:production</code>.</p></div><StatusPill ok={posture.hostedReadiness.authenticationConfigured && posture.hostedReadiness.durableAuditConfigured && posture.hostedReadiness.privateWorkerConfigured} label={posture.hostedReadiness.authenticationConfigured && posture.hostedReadiness.durableAuditConfigured && posture.hostedReadiness.privateWorkerConfigured ? 'Hosted boundary configured' : 'Hosted boundary incomplete'} /></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Durable identity', posture.hostedReadiness.authenticationConfigured, 'Database, auth, origin, email, and production CAPTCHA configuration are present.'],
              ['Durable evidence audit', posture.hostedReadiness.durableAuditConfigured, 'A PostgreSQL or persistent file hash-chain sink is selected.'],
              ['Private authoring worker', posture.hostedReadiness.privateWorkerConfigured, 'The server-side worker URL and capability secret are configured.'],
              ['Founding-partner intake', posture.hostedReadiness.foundingPartnerIntakeConfigured, 'Encrypted contact storage has a dedicated server-only key.'],
            ].map(([title, ok, body]) => <article key={String(title)} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><StatusPill ok={Boolean(ok)} label={Boolean(ok) ? 'Configured' : 'Not configured'} /><h3 className="mt-3 text-sm font-semibold text-slate-950">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{body}</p></article>)}
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="pr9-heading">
          <div className="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">PR #9 hardened release</p>
                <h2 id="pr9-heading" className="mt-1 text-xl font-semibold">A stronger boundary for self-hosted MSP deployments</h2>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Upgrade guidance available
              </span>
            </div>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-3 sm:p-8">
            <article>
              <p className="text-sm font-semibold text-slate-950">Private authoring worker</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Browser requests stay behind the application API. The worker accepts only short-lived, single-use, tenant-bound server capabilities.</p>
            </article>
            <article>
              <p className="text-sm font-semibold text-slate-950">Role-bound operations</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">The retired shared administrator key is replaced by verified individual owner and administrator workspace roles.</p>
            </article>
            <article>
              <p className="text-sm font-semibold text-slate-950">Hardened container defaults</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">The delivered self-hosted configuration applies non-root execution, read-only application roots, health checks, and bounded worker resources.</p>
            </article>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
            <Link href="https://github.com/thecelestialmismatch/RipoDoc/tree/main/docs/05-security" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">
              Review the self-hosted security advisory and migration materials <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
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
                  {posture.auditLog.mode === 'file' ? 'Hash-chained file log' : posture.auditLog.mode === 'postgres' ? 'PostgreSQL hash chain' : 'Structured stdout'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verification result</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {auditVerified
                    ? `${posture.auditLog.verification.records} record${posture.auditLog.verification.records === 1 ? '' : 's'} verified`
                    : auditIssue
                      ? `Failed at record ${posture.auditLog.verification.failedAt}`
                      : posture.auditLog.mode === 'postgres'
                        ? 'Run authenticated production preflight'
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
              <li><span className="mr-2 font-semibold text-blue-700">03.</span>For hosted operation, set <code className="rounded bg-white px-1.5 py-0.5 text-xs">RIPODOC_AUDIT_BACKEND=postgres</code> and apply the durable-audit migration. For self-hosting, persist a reviewed file chain.</li>
              <li><span className="mr-2 font-semibold text-blue-700">04.</span>Run <code className="rounded bg-white px-1.5 py-0.5 text-xs">npm run preflight:production</code> before opening hosted account actions.</li>
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
