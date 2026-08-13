import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  LockKeyhole,
  MousePointerClick,
  Send,
  ShieldCheck,
  TimerReset,
  Upload,
  UsersRound,
  Zap,
} from 'lucide-react';
import { SampleReport } from '@/components/marketing/SampleReport.tsx';
import { loadManifest } from '@/lib/evidence/store.ts';

const SAMPLE_REPORT_ID = 'rpt-demo-0001';

const outcomes = [
  {
    icon: MousePointerClick,
    title: 'A PDF that explains itself',
    body: 'A reader clicks an approved figure and opens the exact rows and provenance behind that figure — not a broad export.',
  },
  {
    icon: LockKeyhole,
    title: 'Evidence stays deliberately scoped',
    body: 'Links are signed for one recipient, time-bound, and individually revocable. A forwarded report is not a second authorization.',
  },
  {
    icon: FileCheck2,
    title: 'Every claim has an accountable owner',
    body: 'A human approves the evidence before publication, and access events are recorded in a tamper-evident audit chain.',
  },
] as const;

const workflow = [
  {
    step: '01',
    title: 'Start with approved source data',
    body: 'Bring a structured CSV, REST response, or reviewed mapping from the systems that already power your report. RipoDoc does not pretend an arbitrary chart contains rows it never had.',
    icon: Upload,
  },
  {
    step: '02',
    title: 'Attach defensible evidence',
    body: 'Approve the rows, query provenance, recipient, and expiry associated with each figure before release.',
    icon: FileCheck2,
  },
  {
    step: '03',
    title: 'Deliver a normal PDF',
    body: 'Your client opens it in their usual viewer. A click opens a tightly scoped evidence view that is logged before it renders.',
    icon: Send,
  },
] as const;

const proofPoints = [
  { icon: FileText, label: 'Standard PDF links work in common viewers' },
  { icon: TimerReset, label: 'Expiry and individual revocation' },
  { icon: ShieldCheck, label: 'Hash-chained access audit trail' },
] as const;

export default async function Home() {
  const manifest = await loadManifest(SAMPLE_REPORT_ID);
  const figureCount = manifest?.elements.length ?? 0;
  const evidenceRowCount = manifest?.elements.reduce((count, element) => count + element.evidence.table.rows.length, 0) ?? 0;

  return (
    <div className="bg-white text-[#11162E]">
      <section className="ripodoc-hero relative isolate overflow-hidden border-b border-slate-200">
        <div className="ripodoc-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -right-32 top-20 h-[32rem] w-[32rem] rounded-full bg-[#12B9BE]/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[28%] h-72 w-72 rounded-full bg-[#1769E8]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#12B9BE]/25 bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#087E84] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#12B9BE]" aria-hidden="true" />
                Secure interactive client reports for MSPs
              </div>
              <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-[-0.06em] text-[#11162E] sm:text-6xl lg:text-[4.15rem]">
                Every report figure has <span className="brand-gradient-text">proof behind it.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                RipoDoc turns the PDF your client already opens into an accountable evidence experience. A click reveals the approved detail behind one reported number, scoped to the intended reader and logged for review.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/founding-partners"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#1769E8] to-[#12B9BE] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-16px_rgba(23,105,232,0.8)] transition duration-200 hover:brightness-105 active:scale-[0.98]"
                >
                  <UsersRound className="h-4 w-4" aria-hidden="true" />
                  Apply as a founding partner
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-[#11162E] shadow-sm transition hover:border-[#12B9BE]/60 hover:bg-white active:scale-[0.98]"
                >
                  Explore the live interaction
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/download"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#1769E8]/20 bg-[#EAF5FF] px-5 py-3 text-sm font-semibold text-[#0A3E9B] transition hover:border-[#1769E8]/45 hover:bg-white active:scale-[0.98]"
                >
                  Download & self-host
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
                {proofPoints.map((point) => {
                  const Icon = point.icon;
                  return <span key={point.label} className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-[#078C68]" aria-hidden="true" />{point.label}</span>;
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#1769E8]/15 to-[#12B9BE]/25 blur-2xl" aria-hidden="true" />
              <div className="relative rounded-[1.5rem] border border-white/80 bg-white/90 p-3 shadow-[0_32px_70px_-36px_rgba(17,22,46,0.65)] backdrop-blur sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF5FF] text-[#1769E8]"><FileText className="h-4 w-4" aria-hidden="true" /></span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">RipoDoc proof view</p>
                      <p className="text-sm font-semibold text-[#11162E]">Click a figure. Inspect the source.</p>
                    </div>
                  </div>
                  <span className="hidden rounded-full bg-[#DDF9F7] px-2.5 py-1 text-[11px] font-semibold text-[#087E84] sm:inline-block">Sample data</span>
                </div>
                {manifest ? <SampleReport manifest={manifest} /> : <DemoUnavailable />}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-3 border-t border-slate-200/80 pt-8 sm:grid-cols-3">
            <Metric value={figureCount.toString()} label="approved sample figures" />
            <Metric value={evidenceRowCount.toString()} label="evidence rows available to inspect" />
            <Metric value="0" label="evidence rows stored in the PDF itself" />
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#087E84]">Designed for the client-report moment</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#11162E] sm:text-5xl">Be ready when the client asks, “Where did that number come from?”</h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            The answer should not be a longer meeting, a spreadsheet hunt, or an unprotected portal link. RipoDoc keeps the report familiar while making the evidence behind a published figure specific, reviewable, and defensible.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {outcomes.map((outcome) => {
            const Icon = outcome.icon;
            return (
              <article key={outcome.title} className="lift-on-hover rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_14px_28px_-24px_rgba(17,22,46,0.5)] hover:border-[#12B9BE]/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EAF5FF] to-[#DDF9F7] text-[#1769E8]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-6 text-xl font-bold tracking-[-0.03em] text-[#11162E]">{outcome.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{outcome.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-200 bg-[#F6F8FC] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#087E84]">One accountable workflow</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#11162E] sm:text-5xl">Keep the client experience simple. Make the evidence rigorous.</h2>
          </div>
          <ol className="mt-12 grid gap-5 lg:grid-cols-3">
            {workflow.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.step} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <span className="absolute right-6 top-5 text-6xl font-bold tracking-[-0.08em] text-[#EAF5FF]" aria-hidden="true">{item.step}</span>
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#11162E] text-white"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 className="relative mt-12 text-xl font-bold tracking-[-0.03em] text-[#11162E]">{item.title}</h3>
                  <p className="relative mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid gap-10 rounded-[2rem] bg-[#11162E] px-6 py-10 text-white sm:px-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:px-14 lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-semibold text-teal-100"><Zap className="h-3.5 w-3.5" aria-hidden="true" />Use the real interaction</div>
            <h2 className="mt-5 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">The report is just the beginning.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">Open the demo to see a report figure resolve to the evidence grid that supports it. The same interaction is available from a generated or overlaid RipoDoc PDF.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/founding-partners" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#11162E] transition hover:bg-[#DDF9F7]"><UsersRound className="h-4 w-4" aria-hidden="true" />Apply as a founding partner</Link>
              <Link href="/security" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"><ShieldCheck className="h-4 w-4" aria-hidden="true" />Inspect security controls</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <ProofStat label="Identity" value="Recipient-bound" />
              <ProofStat label="Access" value="Expiring + revocable" />
              <ProofStat label="Review" value="Logged before render" />
            </div>
            <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-6 text-slate-300">Each report element is bound to its evidence, provenance, approver, and delivery controls. The application exposes safe operational status without displaying any secret or recipient identity.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-gradient-to-br from-[#EAF5FF] via-white to-[#DDF9F7] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#087E84]">Ready to send a report that stands up to questions?</p>
          <h2 className="mt-4 text-4xl font-bold tracking-[-0.045em] text-[#11162E] sm:text-5xl">Start with the report you already have.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Start with approved source data, make the review decision explicit, and deliver the client-facing PDF with tightly controlled supporting evidence.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/founding-partners" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#11162E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0A3E9B]"><UsersRound className="h-4 w-4" aria-hidden="true" />Request a report diagnostic</Link>
            <Link href="/download" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#11162E] transition hover:border-[#1769E8]">Download & self-host<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <div className="border-l border-slate-200 pl-4 first:border-l-0 first:pl-0">
      <p className="text-3xl font-bold tracking-[-0.055em] text-[#11162E]">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function ProofStat({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function DemoUnavailable() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-950">
      <CheckCircle2 className="h-5 w-5 text-amber-700" aria-hidden="true" />
      <p className="mt-3 font-semibold">The interactive sample is not available in this runtime.</p>
      <p className="mt-1">You can still create a report from the upload workflow or inspect the customer workspace.</p>
    </div>
  );
}
