import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Container,
  Download,
  ExternalLink,
  GitBranch,
  LockKeyhole,
  ServerCog,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';

export const metadata = {
  title: 'Download & self-host RipoDoc',
  description: 'Deploy the complete RipoDoc MSP evidence-reporting platform with PostgreSQL, a protected PDF worker, and a hardened web application.',
};

const installSteps = [
  { number: '01', title: 'Get the complete application', body: 'Download the reviewed source bundle or clone the repository. The bundle contains the web application, PostgreSQL configuration, private PDF worker, migrations, tests, runbooks, and Docker definitions.', icon: Download },
  { number: '02', title: 'Configure durable secrets', body: 'Set distinct server-only authentication, evidence-signing, and worker-capability secrets. Configure PostgreSQL, your canonical HTTPS origin, Resend, and Turnstile before enabling account actions.', icon: LockKeyhole },
  { number: '03', title: 'Build and verify your exact images', body: 'Render Compose, build the web and worker images, generate CycloneDX SBOMs, and block the cutover for unreviewed high or critical findings.', icon: ClipboardCheck },
  { number: '04', title: 'Operate behind your TLS boundary', body: 'Run the web service behind a reverse proxy. PostgreSQL stays private; the worker is available only to the trusted web service and rejects browser-direct requests.', icon: ServerCog },
] as const;

export default function DownloadPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-950">
      <section className="overflow-hidden bg-[#07152d] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-center lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
              <Container className="h-3.5 w-3.5" aria-hidden="true" />
              Complete self-hosted application
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Bring defensible reporting inside your MSP operating model.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Download the full RipoDoc platform: customer workspace, evidence-aware reporting application, PostgreSQL-backed identity, protected PDF authoring worker, hardened Compose stack, tests, SBOM procedures, and operational runbooks.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://github.com/thecelestialmismatch/RipoDoc/archive/refs/heads/main.zip"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1769E8] to-[#12B9BE] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-16px_rgba(18,185,190,0.8)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#07152d]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download source bundle
              </a>
              <a
                href="https://github.com/thecelestialmismatch/RipoDoc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#07152d]"
              >
                <GitBranch className="h-4 w-4" aria-hidden="true" />
                Review source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-sm font-bold"><TerminalSquare className="h-4 w-4 text-cyan-200" aria-hidden="true" /> Production quick start</div>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200">Compose-ready</span>
            </div>
            <pre className="mt-5 overflow-x-auto rounded-xl bg-black/30 p-4 text-xs leading-6 text-slate-200 sm:text-sm"><code>{`git clone https://github.com/thecelestialmismatch/RipoDoc.git
cd RipoDoc

# Store real values outside the repository.
export POSTGRES_PASSWORD="$(openssl rand -base64 32)"
export RIPODOC_AUTH_SECRET="$(openssl rand -base64 32)"
export RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)"
export RIPODOC_WORKER_AUTH_SECRET="$(openssl rand -base64 32)"

docker compose -f docker-compose.selfhost.yml up --build`}</code></pre>
            <p className="mt-4 text-xs leading-5 text-slate-400">Before opening the service to users, configure the required PostgreSQL, canonical-origin, Resend, and Turnstile values, then follow the full release-gate procedure below.</p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-16">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {installSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">{step.number}</span>
                <Icon className="mt-5 h-5 w-5 text-cyan-700" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-bold text-slate-950">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Release gate</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">A downloadable app should be deployable, inspectable, and supportable.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">RipoDoc’s self-hosted package is designed for MSP change control. You retain the full source, configure your own durable identity and email services, verify your exact images, and operate the reporting boundary behind your infrastructure controls.</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                'PostgreSQL-backed users, sessions, rate limits, and report ownership',
                'Private capability-authenticated PDF worker with tenant and review binding',
                'Non-root, read-only, resource-bounded Compose defaults',
                'CycloneDX SBOM generation and final-image vulnerability scan procedure',
                'Hash-chain audit verification and backup/restore runbook',
                'Customer workspace, operator controls, and recipient proof gate',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <aside className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/15 sm:p-8">
            <ShieldCheck className="h-6 w-6 text-cyan-300" aria-hidden="true" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">Start with the operator packet</p>
            <h2 className="mt-2 text-2xl font-bold">Do the secure cutover once.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">The PR #11 migration guide is written for the person on call: preflight, secrets, Compose rendering, final-image scanning, verification, rollback, and the evidence packet your customers may request.</p>
            <a
              href="https://github.com/thecelestialmismatch/RipoDoc/blob/main/docs/05-security/pr11-self-hosted-security-advisory-and-migration-guide.md"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-cyan-200 transition hover:text-cyan-100"
            >
              Open PR #11 migration guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </aside>
        </section>

        <section className="mt-12 rounded-2xl border border-blue-100 bg-blue-50/65 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Already deployed?</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Open the tenant workspace and see every approved client report.</h2>
            <p className="mt-2 text-sm text-slate-600">The command center makes report discovery, evidence readiness, and secure manifest retrieval fast without relaxing tenant boundaries.</p>
          </div>
          <Link href="/dashboard" className="mt-5 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 sm:mt-0">
            Open client workspace <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
    </div>
  );
}
