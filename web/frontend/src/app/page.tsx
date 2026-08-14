import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  FileCheck2,
  FileText,
  Fingerprint,
  LockKeyhole,
  MousePointer2,
  Network,
  ScanSearch,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { SampleReport } from '@/components/marketing/SampleReport.tsx';
import { loadManifest } from '@/lib/evidence/store.ts';

export const metadata: Metadata = {
  title: 'Controlled evidence delivery for MSP client reports',
  description: 'RipoDoc lets MSPs keep the familiar client PDF while giving approved report figures a recipient-scoped, expiring and auditable proof path.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'RipoDoc | Controlled evidence delivery for MSP client reports',
    description: 'Keep the client PDF familiar. Make the evidence behind a reported claim deliberate, recipient-scoped and accountable.',
    url: '/',
  },
};

const SAMPLE_REPORT_ID = 'rpt-demo-0001';

const controlMoments: readonly { readonly number: string; readonly title: string; readonly detail: string; readonly icon: LucideIcon }[] = [
  {
    number: '01',
    title: 'Keep the client artifact familiar',
    detail: 'Deliver the PDF your client already opens. RipoDoc adds a controlled evidence path without turning a QBR into another portal login.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'Make the proof intentional',
    detail: 'Approve the rows, provenance, reader and expiry that support a single reported figure before it leaves the review boundary.',
    icon: FileCheck2,
  },
  {
    number: '03',
    title: 'Control the reader, not just the link',
    detail: 'A forwarded PDF is not a second authorization. Evidence access is recipient-bound, expiring, revocable and observable.',
    icon: Fingerprint,
  },
] as const;

const realityChecks = [
  ['NOT A DASHBOARD REPLACEMENT', 'Keep PSA, RMM and BI where they belong. RipoDoc delivers the evidence layer at the client-report moment.'],
  ['NOT A PDF EXTRACTION PROMISE', 'Start with connected, reviewed source data. An arbitrary chart does not reliably contain the rows needed to prove a claim.'],
  ['NOT A PERMANENT SHARE LINK', 'A report element can carry the right proof for the right reader and lose access when the decision changes.'],
] as const;

export default async function Home() {
  const manifest = await loadManifest(SAMPLE_REPORT_ID);
  const figureCount = manifest?.elements.length ?? 0;
  const evidenceRowCount = manifest?.elements.reduce((count, element) => count + element.evidence.table.rows.length, 0) ?? 0;

  return (
    <div className="overflow-hidden bg-[#f5f7fb] text-[#0b1226]">
      <section className="proof-canvas relative isolate overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />
        <div className="pointer-events-none absolute left-[8%] top-0 h-full w-px bg-white/10" />
        <div className="pointer-events-none absolute right-[12%] top-0 h-full w-px bg-white/10" />
        <div className="pointer-events-none absolute -right-20 top-28 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-14 lg:pb-28 lg:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[0.87fr_1.13fr]">
            <div className="max-w-2xl">
              <p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Evidence delivery for MSP client reports</p>
              <h1 className="mt-7 text-5xl font-bold leading-[0.98] tracking-[-0.065em] text-white sm:text-6xl lg:text-[5.1rem]">
                Make every
                <span className="block text-teal-300">report claim</span>
                able to answer back.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                RipoDoc turns the PDF your client already trusts into a controlled evidence experience. Click one number. See only the approved detail behind it. Keep the decision accountable.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="#proof-view" className="inline-flex min-h-12 items-center gap-2 bg-teal-300 px-5 py-3 text-sm font-bold text-[#06152b] transition hover:bg-white active:scale-[0.98]">
                  Explore the proof view <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/founding-partners" className="inline-flex min-h-12 items-center gap-2 border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-teal-200/80 hover:bg-white/10 active:scale-[0.98]">
                  Request a report diagnostic <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-5 text-xs text-slate-300 sm:text-sm">
                <span className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />Normal PDF delivery</span>
                <span className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />Reader-scoped proof</span>
                <span className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />Review-ready audit</span>
              </div>
            </div>

            <div id="proof-view" className="relative scroll-mt-28">
              <div className="proof-scanline absolute -left-8 right-8 top-10 h-px" aria-hidden="true" />
              <div className="document-cut interaction-shadow relative bg-[#f7fbff] p-3 text-[#0b1226] sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center bg-[#e7f0ff] text-[#2f62e8]"><ScanSearch className="h-4 w-4" aria-hidden="true" /></span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">RipoDoc proof view</p>
                      <p className="text-sm font-bold text-[#0b1226]">Select a report figure. Inspect its evidence.</p>
                    </div>
                  </div>
                  <span className="hidden border border-teal-800/15 bg-[#dcfbf5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#007e83] sm:inline-block">Sample data</span>
                </div>
                {manifest ? <SampleReport manifest={manifest} /> : <DemoUnavailable />}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-px bg-white/10 text-white">
                <ProofMetric value={figureCount.toString()} label="approved figures" />
                <ProofMetric value={evidenceRowCount.toString()} label="sample evidence rows" />
                <ProofMetric value="0" label="rows embedded in the PDF" />
              </div>
              <p className="mt-4 max-w-lg text-xs leading-5 text-slate-400">Interactive sample uses fixture data. A production report remains governed by its approved manifest, recipient controls and delivery boundary.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-[#007e83]">The client-report moment</p>
              <h2 className="mt-5 text-4xl font-bold leading-[1.02] tracking-[-0.055em] text-[#0b1226] sm:text-5xl">A client question should not create a data chase.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">When a client asks where a number came from, the answer should be as deliberate as the report itself. RipoDoc keeps the meeting moving by making the approved proof available at the figure—not in a later spreadsheet, a broad portal export, or a new meeting.</p>
          </div>
          <div className="mt-14 grid border-y border-slate-200 lg:grid-cols-3">
            {controlMoments.map((moment) => {
              const Icon = moment.icon;
              return (
                <article key={moment.number} className="evidence-rail relative border-b border-slate-200 px-7 py-8 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:px-9">
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#2f62e8]">{moment.number}</span>
                    <Icon className="h-5 w-5 text-[#007e83]" aria-hidden="true" />
                  </div>
                  <h3 className="mt-10 text-2xl font-bold tracking-[-0.035em] text-[#0b1226]">{moment.title}</h3>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">{moment.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-200 bg-[#eef2f8] py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-[#007e83]">The proof canvas</p>
            <h2 className="mt-5 text-4xl font-bold leading-[1.02] tracking-[-0.055em] text-[#0b1226] sm:text-5xl">The report stays calm. The controls stay close.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">RipoDoc is designed around a simple publishing boundary: source data is reviewed, each figure is connected to a controlled evidence view, and delivery remains familiar to the intended reader.</p>
            <div className="mt-8 border-t border-slate-300 pt-6">
              <Link href="/security" className="inline-flex items-center gap-2 text-sm font-bold text-[#17378d] transition hover:text-[#007e83]">Inspect the security-control boundary <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="relative bg-[#0b1226] p-6 text-white sm:p-8">
            <div className="absolute right-0 top-0 h-24 w-24 border-b border-l border-teal-300/40" aria-hidden="true" />
            <div className="flex items-center justify-between border-b border-white/15 pb-5">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">One accountable workflow</span>
              <Network className="h-5 w-5 text-teal-300" aria-hidden="true" />
            </div>
            <ol className="mt-7 space-y-0">
              <WorkflowRow number="01" title="Connect reviewed source data" detail="Start with a structured CSV, REST response, or reviewed mapping—not a promise to extract unprovable data from arbitrary charts." />
              <WorkflowRow number="02" title="Approve the evidence set" detail="Attach the rows, provenance, recipient and expiry that support a particular reported claim." />
              <WorkflowRow number="03" title="Deliver a controlled proof path" detail="The reader opens the familiar PDF. The proof view checks identity, scope and status before rendering detail." />
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 border-b border-slate-200 pb-12 lg:grid-cols-[1fr_0.86fr] lg:items-end">
            <div>
              <p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-[#007e83]">Truthful by design</p>
              <h2 className="mt-5 text-4xl font-bold leading-[1.02] tracking-[-0.055em] text-[#0b1226] sm:text-5xl">A clear product is more credible than a broad promise.</h2>
            </div>
            <p className="text-lg leading-8 text-slate-600">RipoDoc has a narrow job: deliver approved report evidence with intentional access controls. It does not claim to replace the systems that produce your operational data.</p>
          </div>
          <div className="divide-y divide-slate-200">
            {realityChecks.map(([label, detail]) => (
              <div key={label} className="grid gap-5 py-7 md:grid-cols-[0.47fr_1fr] md:gap-12">
                <h3 className="text-sm font-bold tracking-[0.08em] text-[#17378d]">{label}</h3>
                <p className="max-w-2xl text-base leading-7 text-slate-600">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#17378d] bg-[#e7f0ff] py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#17378d]">Choose the right first move</p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-[#0b1226] sm:text-5xl">Start with the report—and the boundary you need.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/founding-partners" className="lift-on-hover group border border-[#2f62e8]/25 bg-white p-5 transition hover:border-[#2f62e8]">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#007e83]">For MSP teams</span>
              <span className="mt-2 flex items-center justify-between gap-4 text-lg font-bold text-[#0b1226]">Request a report diagnostic <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">Validate the report moment with a founding-partner workflow.</span>
            </Link>
            <Link href="/download" className="lift-on-hover group border border-[#2f62e8]/25 bg-[#0b1226] p-5 text-white transition hover:border-teal-300">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-teal-200">For operators</span>
              <span className="mt-2 flex items-center justify-between gap-4 text-lg font-bold">Download &amp; self-host <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
              <span className="mt-2 block text-sm leading-6 text-slate-300">Run the app, database and private authoring worker in your controlled environment.</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#081126] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="eyebrow-rule text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Research the method</p>
              <h2 className="mt-5 text-4xl font-bold leading-[1.02] tracking-[-0.055em] sm:text-5xl">Let the buyer inspect the thinking—not just the interface.</h2>
            </div>
            <div className="grid gap-px bg-white/15 sm:grid-cols-3">
              <ResourceLink href="/security" icon={ShieldCheck} title="Security controls" detail="Review the safe operational posture and evidence boundary." />
              <ResourceLink href="/legal" icon={LockKeyhole} title="Legal status" detail="See verified facts and the remaining launch approval gate." />
              <ResourceLink href="https://github.com/thecelestialmismatch/RipoDoc" icon={MousePointer2} title="Open source" detail="Inspect the implementation, self-host bundle and research." external />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProofMetric({ value, label }: { readonly value: string; readonly label: string }) {
  return <div className="bg-[#081126] px-4 py-4 sm:px-5"><p className="text-2xl font-bold tracking-[-0.05em] text-white">{value}</p><p className="mt-1 text-[11px] font-medium leading-4 text-slate-400">{label}</p></div>;
}

function WorkflowRow({ number, title, detail }: { readonly number: string; readonly title: string; readonly detail: string }) {
  return <li className="grid grid-cols-[45px_1fr] gap-3 border-b border-white/10 py-6 last:border-b-0"><span className="font-mono text-xs font-bold tracking-[0.13em] text-teal-300">{number}</span><div><h3 className="text-xl font-bold tracking-[-0.025em]">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{detail}</p></div></li>;
}

function ResourceLink({ href, icon: Icon, title, detail, external = false }: { readonly href: string; readonly icon: LucideIcon; readonly title: string; readonly detail: string; readonly external?: boolean }) {
  const content = <><Icon className="h-5 w-5 text-teal-300" aria-hidden="true" /><h3 className="mt-10 text-xl font-bold tracking-[-0.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-200">Explore <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span></>;
  const className = 'lift-on-hover block min-h-62 bg-[#101e40] p-6 transition hover:bg-[#142851]';
  return external ? <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a> : <Link href={href} className={className}>{content}</Link>;
}

function DemoUnavailable() {
  return <div className="border border-amber-300 bg-amber-50 p-6 text-sm leading-6 text-amber-950"><p className="font-bold">The interactive sample is not available in this runtime.</p><p className="mt-2">You can still inspect the self-hosted workflow and public security controls.</p></div>;
}
