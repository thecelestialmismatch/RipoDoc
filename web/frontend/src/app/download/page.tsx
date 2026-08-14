import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ClipboardCheck,
  Download,
  ExternalLink,
  GitBranch,
  LockKeyhole,
  ServerCog,
  ShieldCheck,
  TerminalSquare,
  type LucideIcon,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Download & self-host RipoDoc',
  description: 'Deploy the complete RipoDoc evidence-reporting application with PostgreSQL, a private authoring worker, hardened Compose defaults, and operator runbooks.',
  alternates: { canonical: '/download' },
  openGraph: { title: 'Download & self-host RipoDoc', description: 'Operate controlled evidence delivery under your own MSP infrastructure boundary.', url: '/download' },
};

const installSteps: readonly { readonly number: string; readonly title: string; readonly body: string; readonly icon: LucideIcon }[] = [
  { number: '01', title: 'Acquire the whole application', body: 'Clone the repository or download the source bundle. It includes the application, migrations, worker, Compose definition, tests, security materials and operator documentation.', icon: Download },
  { number: '02', title: 'Set the real production boundary', body: 'Configure distinct server-only identity, evidence and worker secrets. Set PostgreSQL, canonical HTTPS origin, transactional email and CAPTCHA before you enable account actions.', icon: LockKeyhole },
  { number: '03', title: 'Verify your exact release', body: 'Render Compose, build the web and worker images, generate CycloneDX SBOMs, and review the final-image vulnerability-scan outcome before a production cutover.', icon: ClipboardCheck },
  { number: '04', title: 'Operate behind your TLS edge', body: 'Keep PostgreSQL private. Keep the worker available only to the trusted web service. The worker rejects browser-direct requests and requires short-lived server capabilities.', icon: ServerCog },
];

const stackItems = [
  'PostgreSQL-backed users, opaque sessions, rate limits and report ownership',
  'Private capability-authenticated PDF worker with tenant and review binding',
  'Non-root, read-only, resource-bounded Compose defaults',
  'CycloneDX SBOM generation and final-image scan procedure',
  'Hash-chain audit verification and backup/restore runbook',
  'Authenticated production preflight for database schema and worker reachability',
] as const;

export default function DownloadPage() {
  return <div className="bg-[#f5f7fb] text-[#0b1226]">
    <section className="proof-canvas relative overflow-hidden text-white">
      <div className="pointer-events-none absolute left-[10%] top-0 h-full w-px bg-white/10" />
      <div className="pointer-events-none absolute right-[7%] top-0 h-full w-px bg-white/10" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_0.98fr] lg:items-center lg:py-24">
        <div>
          <p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Complete self-hosted application</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.06em] sm:text-6xl">Bring accountable reporting inside your operating model.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">Download the full RipoDoc application: customer workspace, evidence-reporting surface, PostgreSQL-backed identity, protected authoring worker, hardened Compose stack, tests and operating materials.</p>
          <div className="mt-9 flex flex-wrap gap-3"><a href="https://github.com/thecelestialmismatch/RipoDoc/archive/refs/heads/main.zip" className="inline-flex min-h-12 items-center gap-2 bg-teal-300 px-5 py-3 text-sm font-bold text-[#06152b] transition hover:bg-white"><Download className="h-4 w-4" aria-hidden="true" />Download source bundle</a><a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 border border-white/25 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-teal-200 hover:bg-white/10"><GitBranch className="h-4 w-4" aria-hidden="true" />Review source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></div>
        </div>
        <div className="document-cut border border-white/15 bg-[#081126]/90 p-5 shadow-2xl shadow-black/30 sm:p-6">
          <div className="flex items-center justify-between border-b border-white/15 pb-4"><div className="inline-flex items-center gap-2 text-sm font-bold"><TerminalSquare className="h-4 w-4 text-teal-300" aria-hidden="true" />Production quick start</div><span className="border border-teal-300/30 bg-teal-300/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-teal-100">Compose-ready</span></div>
          <pre className="mt-5 overflow-x-auto border border-white/10 bg-black/30 p-4 font-mono text-xs leading-6 text-slate-200 sm:text-sm"><code>{`git clone https://github.com/thecelestialmismatch/RipoDoc.git
cd RipoDoc

# Store real values outside the repository.
export POSTGRES_PASSWORD="$(openssl rand -base64 32)"
export RIPODOC_AUTH_SECRET="$(openssl rand -base64 32)"
export RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)"
export RIPODOC_WORKER_AUTH_SECRET="$(openssl rand -base64 32)"
export RIPODOC_LEAD_ENCRYPTION_KEY="$(openssl rand -base64 32 | tr '+/' '-_' | tr -d '=')"

docker compose -f docker-compose.selfhost.yml up --build`}</code></pre>
          <p className="mt-4 text-xs leading-5 text-slate-400">Before you open account actions, configure PostgreSQL, canonical origin, email and CAPTCHA values, then run the full authenticated release gate.</p>
        </div>
      </div>
    </section>

    <main>
      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20" aria-labelledby="operating-model-heading">
        <div className="grid gap-8 border-b border-slate-300 pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"><div><p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-[#007e83]">Choose the boundary</p><h2 id="operating-model-heading" className="mt-4 text-4xl font-bold leading-[1.02] tracking-[-0.055em] sm:text-5xl">One familiar PDF. Three distinct operating responsibilities.</h2></div><p className="max-w-2xl text-base leading-7 text-slate-600">The client experience, your authoring workspace and the worker that handles protected report generation are intentionally separate. Choose the operating model that matches your ownership of infrastructure and customer data.</p></div>
        <div className="mt-0 grid border-b border-slate-300 md:grid-cols-3">
          <OperatingPath mark="A" title="Inspect the proof experience" detail="Evaluate the client interaction without submitting customer data. The public sample makes the evidence interaction concrete." href="/#proof-view" cta="Open proof view" />
          <OperatingPath mark="B" title="Validate the report moment" detail="For MSP teams that want to shape a supported workflow around their actual review and QBR reporting process." href="/founding-partners" cta="Request a diagnostic" />
          <OperatingPath mark="C" title="Own the full stack" detail="For operators who will manage PostgreSQL, email, reverse proxy, audit retention and the worker network boundary under change control." href="#operator-path" cta="Read the operator path" />
        </div>
      </section>

      <section id="operator-path" className="border-y border-slate-200 bg-white py-16 lg:py-20"><div className="mx-auto max-w-7xl px-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-[#007e83]">Operator path</p><h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">A real deployment, in four accountable moves.</h2></div><p className="max-w-xl text-base leading-7 text-slate-600">The downloadable bundle is intended to be inspected, modified and operated—not treated as a black box.</p></div><div className="mt-12 grid border-y border-slate-200 md:grid-cols-2 xl:grid-cols-4">{installSteps.map((step) => { const Icon = step.icon; return <article key={step.number} className="evidence-rail relative border-b border-r border-slate-200 p-6 last:border-r-0 md:border-b-0"><span className="font-mono text-xs font-bold tracking-[0.16em] text-[#2f62e8]">{step.number}</span><Icon className="mt-8 h-5 w-5 text-[#007e83]" aria-hidden="true" /><h3 className="mt-5 text-xl font-bold tracking-[-0.035em]">{step.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{step.body}</p></article>; })}</div></div></section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <article><p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-[#007e83]">Release gate</p><h2 className="mt-4 text-4xl font-bold leading-[1.02] tracking-[-0.055em]">A downloadable app should be deployable, inspectable and supportable.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">RipoDoc’s self-hosted package is designed for MSP change control. You retain the full source, configure durable identity and email services, verify your exact images, and operate the reporting boundary behind your infrastructure controls.</p><ul className="mt-9 grid gap-x-9 gap-y-4 sm:grid-cols-2">{stackItems.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#007e83]" aria-hidden="true" />{item}</li>)}</ul></article>
        <aside className="document-cut bg-[#0b1226] p-7 text-white sm:p-8"><ShieldCheck className="h-6 w-6 text-teal-300" aria-hidden="true" /><p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-teal-200">Start with the operator packet</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.045em]">Do the secure cutover once.</h2><p className="mt-4 text-sm leading-7 text-slate-300">The operator materials cover secrets, Compose rendering, durable audit configuration, image scanning, authenticated preflight, verification, rollback and the evidence packet customers may request.</p><div className="mt-6 border border-white/10 bg-black/20 p-4 font-mono text-xs leading-6 text-slate-200"><span className="text-slate-400"># Run after migrations and service configuration</span><br />npm run preflight:production</div><a href="https://github.com/thecelestialmismatch/RipoDoc/tree/main/docs/05-security" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-teal-200 transition hover:text-white">Open security &amp; migration materials <ArrowRight className="h-4 w-4" aria-hidden="true" /></a></aside>
      </section>

      <section className="border-t border-slate-200 bg-[#e7f0ff] py-14"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#17378d]">Not ready to run it yourself?</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.035em]">Start with a report diagnostic, not a generic demo.</h2><p className="mt-2 text-sm leading-6 text-slate-600">Bring the reporting workflow you already have. Work through the proof moment, the data boundary and the deployment path that fits it.</p></div><Link href="/founding-partners" className="inline-flex w-fit items-center gap-2 bg-[#0b1226] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#17378d]">Request a report diagnostic <ArrowDownRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>
    </main>
  </div>;
}

function OperatingPath({ mark, title, detail, href, cta }: { readonly mark: string; readonly title: string; readonly detail: string; readonly href: string; readonly cta: string }) {
  return <article className="evidence-rail relative border-r border-t border-slate-300 px-7 py-8 last:border-r-0"><span className="font-mono text-xs font-bold tracking-[0.16em] text-[#2f62e8]">PATH {mark}</span><h3 className="mt-8 text-2xl font-bold tracking-[-0.035em]">{title}</h3><p className="mt-3 min-h-22 text-sm leading-7 text-slate-600">{detail}</p><Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#17378d] transition hover:text-[#007e83]">{cta}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article>;
}
