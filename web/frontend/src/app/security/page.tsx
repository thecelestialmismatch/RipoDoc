import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  CircleAlert,
  DatabaseZap,
  FileCheck2,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  TimerReset,
  type LucideIcon,
} from 'lucide-react';
import { getSecurityPosture } from '@/lib/evidence/security-status.ts';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Security controls and operating boundary',
  description: 'Inspect RipoDoc’s public control model for recipient-bound evidence access, expiry, revocation, immutable manifests, audit verification, and self-hosted operating posture.',
  alternates: { canonical: '/security' },
  openGraph: { title: 'RipoDoc security controls', description: 'Inspect the control boundary for recipient-scoped, time-limited report evidence.', url: '/security' },
};

function StatusMark({ ok, label }: { readonly ok: boolean; readonly label: string }) {
  return <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${ok ? 'border-[#007e83]/25 bg-[#dcfbf5] text-[#007e83]' : 'border-amber-400/35 bg-amber-50 text-amber-900'}`}>{ok ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />}{label}</span>;
}

export default async function SecurityPage() {
  const posture = await getSecurityPosture();
  const auditVerified = posture.auditLog.verification?.ok === true;
  const auditIssue = posture.auditLog.verification?.ok === false;
  const hostedReady = posture.hostedReadiness.authenticationConfigured && posture.hostedReadiness.durableAuditConfigured && posture.hostedReadiness.privateWorkerConfigured;
  const controls: readonly { readonly mark: string; readonly icon: LucideIcon; readonly title: string; readonly status: boolean; readonly statusLabel: string; readonly body: string }[] = [
    { mark: 'A', icon: KeyRound, title: 'Recipient-bound signatures', status: posture.evidenceSecretConfigured, statusLabel: posture.evidenceSecretConfigured ? 'Signing secret configured' : 'Action required', body: 'Every evidence URL is HMAC-signed and includes a hash of the intended recipient. A forwarded URL does not become a valid second reader.' },
    { mark: 'B', icon: TimerReset, title: 'Expiry and revocation', status: true, statusLabel: `${posture.revokedTokenCount} revoked token${posture.revokedTokenCount === 1 ? '' : 's'} configured`, body: 'Evidence claims carry their own expiry. Token identifiers can be revoked individually without reissuing the report or rotating the signing key.' },
    { mark: 'C', icon: DatabaseZap, title: 'Scoped evidence delivery', status: true, statusLabel: 'Least-data response', body: 'A recipient sees only the approved rows behind one requested figure, not a customer-wide data export or a public report portal.' },
    { mark: 'D', icon: FileCheck2, title: 'Immutable manifests', status: posture.publishedReportCount > 0, statusLabel: `${posture.publishedReportCount} validated manifest${posture.publishedReportCount === 1 ? '' : 's'}`, body: 'Published reports pass full schema validation before storage. Their evidence, provenance, version, and recipient details are treated as immutable.' },
  ];

  return <div className="bg-[#f5f7fb] text-[#0b1226]">
    <section className="proof-canvas relative overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(8,17,38,0.1),rgba(8,17,38,0.85))]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:py-24">
        <div>
          <p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Public control report</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.06em] sm:text-6xl">The evidence boundary should be easier to inspect than to assume.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">RipoDoc is designed for least-privilege report evidence: the smallest approved dataset, for the intended reader, for a defined time. This page publishes safe operational posture—not secrets, recipients or audit records.</p>
        </div>
        <div className="border border-white/20 bg-[#081126]/75 p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">Hosted production gate</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.035em]">A deployment earns the right to collect data.</h2></div><ShieldCheck className="h-6 w-6 shrink-0 text-teal-300" aria-hidden="true" /></div>
          <div className="mt-7 border-t border-white/15 pt-5"><StatusMark ok={hostedReady} label={hostedReady ? 'Boundary configured' : 'Boundary incomplete'} /><p className="mt-4 text-sm leading-6 text-slate-300">Configuration state is not a production approval. The release gate also requires authenticated checks, schema verification and private-worker reachability.</p></div>
        </div>
      </div>
    </section>

    <main>
      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20" aria-labelledby="control-boundary-heading">
        <div className="flex flex-col gap-5 border-b border-slate-300 pb-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-[#007e83]">Control boundary</p><h2 id="control-boundary-heading" className="mt-4 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">What a controlled proof view is designed to do.</h2></div><p className="max-w-md text-base leading-7 text-slate-600">These are runtime-safe control summaries. Status indications reflect configuration and local state, not a blanket compliance certification.</p></div>
        <div className="mt-0 grid border-b border-slate-300 md:grid-cols-2">
          {controls.map((control) => { const Icon = control.icon; return <article key={control.title} className="evidence-rail relative border-r border-t border-slate-300 px-7 py-8 even:border-r-0 md:px-9"><div className="flex items-start justify-between gap-4"><span className="font-mono text-xs font-bold tracking-[0.15em] text-[#2f62e8]">{control.mark} / CONTROL</span><Icon className="h-5 w-5 text-[#007e83]" aria-hidden="true" /></div><div className="mt-8"><StatusMark ok={control.status} label={control.statusLabel} /></div><h3 className="mt-5 text-2xl font-bold tracking-[-0.035em]">{control.title}</h3><p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">{control.body}</p></article>; })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16 lg:py-20" aria-labelledby="readiness-heading">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-end"><div><p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-[#007e83]">Readiness ledger</p><h2 id="readiness-heading" className="mt-4 text-4xl font-bold leading-[1.02] tracking-[-0.055em]">No green badge without an actual boundary.</h2></div><p className="max-w-2xl text-base leading-7 text-slate-600">The hosted workspace remains fail-closed unless necessary production configuration is present. Self-hosted operators should still run the published preflight before opening account actions.</p></div>
          <div className="mt-12 grid border-y border-slate-200 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Durable identity', posture.hostedReadiness.authenticationConfigured, 'Database, auth, origin, email and production CAPTCHA configuration are present.'],
              ['Durable evidence audit', posture.hostedReadiness.durableAuditConfigured, 'A PostgreSQL or persistent file hash-chain sink is selected.'],
              ['Private authoring worker', posture.hostedReadiness.privateWorkerConfigured, 'The server-side worker URL and capability secret are configured.'],
              ['Partner intake boundary', posture.hostedReadiness.foundingPartnerIntakeConfigured, 'Encrypted contact storage has a dedicated server-only key.'],
            ].map(([title, ok, body], index) => <article key={String(title)} className="border-b border-r border-slate-200 px-5 py-6 last:border-r-0 md:border-b-0"><span className="font-mono text-xs font-bold text-[#2f62e8]">0{index + 1}</span><div className="mt-5"><StatusMark ok={Boolean(ok)} label={Boolean(ok) ? 'Configured' : 'Not configured'} /></div><h3 className="mt-5 text-base font-bold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{String(body)}</p></article>)}
          </div>
          <p className="mt-7 text-sm leading-6 text-slate-600">Run <code className="border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-[#17378d]">npm run preflight:production</code> as part of an authenticated operational release check.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20" aria-labelledby="audit-heading">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="document-cut bg-[#0b1226] p-7 text-white sm:p-9"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">Tamper-evident audit chain</p><h2 id="audit-heading" className="mt-3 text-3xl font-bold tracking-[-0.045em]">Every access event belongs to an order that can be verified.</h2></div><Fingerprint className="h-6 w-6 text-teal-300" aria-hidden="true" /></div><p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">Audit events are chained with SHA-256 so deletion, reordering or modification is detectable during verification. The runtime reports only the safe posture of that check.</p><div className="mt-9 grid gap-px bg-white/15 sm:grid-cols-2"><div className="bg-[#101e40] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Persistence mode</p><p className="mt-3 text-lg font-bold">{posture.auditLog.mode === 'file' ? 'Hash-chained file log' : posture.auditLog.mode === 'postgres' ? 'PostgreSQL hash chain' : 'Structured stdout'}</p></div><div className="bg-[#101e40] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Verification result</p><p className="mt-3 text-lg font-bold">{auditVerified ? `${posture.auditLog.verification.records} record${posture.auditLog.verification.records === 1 ? '' : 's'} verified` : auditIssue ? `Failed at record ${posture.auditLog.verification.failedAt}` : posture.auditLog.mode === 'postgres' ? 'Run authenticated production preflight' : 'No readable file log in this runtime'}</p></div></div><p className={`mt-5 border px-4 py-3 text-sm leading-6 ${auditIssue ? 'border-rose-400/40 bg-rose-500/10 text-rose-100' : 'border-white/15 bg-white/5 text-slate-300'}`}>{posture.auditLog.message}</p><div className="mt-5 border border-white/10 bg-black/25 p-4 font-mono text-xs leading-6 text-slate-200"><span className="text-slate-400"># Verify a persisted audit log</span><br />npm run audit:verify -- --path /secure/audit/evidence-access.jsonl</div></article>
          <aside className="border border-slate-200 bg-white p-7"><LockKeyhole className="h-6 w-6 text-[#2f62e8]" aria-hidden="true" /><h2 className="mt-5 text-2xl font-bold tracking-[-0.035em]">Operator release checklist</h2><ol className="mt-7 space-y-5 text-sm leading-6 text-slate-600"><li><strong className="font-mono text-[#2f62e8]">01 / </strong>Set a 32+ character <code className="bg-slate-100 px-1.5 py-0.5 text-xs">RIPODOC_EVIDENCE_SECRET</code>.</li><li><strong className="font-mono text-[#2f62e8]">02 / </strong>Send the evidence link only to its intended reader and choose an appropriate expiry.</li><li><strong className="font-mono text-[#2f62e8]">03 / </strong>Use durable audit storage: PostgreSQL for hosted operation, or a reviewed persisted file chain for self-hosting.</li><li><strong className="font-mono text-[#2f62e8]">04 / </strong>Run the production preflight before opening hosted account actions.</li></ol><div className="mt-9 border-t border-slate-200 pt-5"><Link href="/download" className="inline-flex items-center gap-2 text-sm font-bold text-[#17378d] transition hover:text-[#007e83]">Open self-hosted deployment guidance <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></aside>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#e7f0ff] py-14"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#17378d]">Self-hosted operating posture</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#0b1226]">Inspect the hardening model before you operate it.</h2></div><Link href="https://github.com/thecelestialmismatch/RipoDoc/tree/main/docs/05-security" className="inline-flex w-fit items-center gap-2 bg-[#0b1226] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#17378d]">Read the migration and advisory materials <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>
    </main>
  </div>;
}
