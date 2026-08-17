import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Braces, CheckCircle2, CircleDot, FileCheck2, FileText, Fingerprint, Layers3, ScanSearch, ShieldCheck } from 'lucide-react';
import { SampleReport } from '@/components/marketing/SampleReport.tsx';
import { loadManifest } from '@/lib/evidence/store.ts';

export const metadata: Metadata = {
  title: 'RipoDoc — controlled evidence delivery for MSP client reports',
  description: 'RipoDoc helps managed service providers keep client reports concise while giving selected claims an approved, recipient-aware, expiring evidence path.',
  alternates: { canonical: '/' },
  openGraph: { title: 'RipoDoc — controlled evidence delivery for MSP client reports', description: 'A client report can stay concise and still make one approved claim answerable.', url: '/' },
};

const SAMPLE_REPORT_ID = 'rpt-demo-0001';

const recordFields = [
  { number: '01', title: 'Claim', detail: 'A report sentence precise enough for a client to question.', icon: FileText },
  { number: '02', title: 'Source', detail: 'The reviewed structured data or mapping that gives the claim meaning.', icon: Layers3 },
  { number: '03', title: 'Scope', detail: 'Only the approved detail that supports this one statement.', icon: ScanSearch },
  { number: '04', title: 'Reader', detail: 'A deliberate recipient condition, not a forwarded link.', icon: Fingerprint },
  { number: '05', title: 'Review', detail: 'An accountable decision before the evidence path is published.', icon: FileCheck2 },
] as const;

const resources = [
  { href: '/report-evidence-readiness', icon: CheckCircle2, label: 'No-data check', title: 'Is a report claim ready for evidence?', detail: 'Run a five-question readiness check without uploading a report.' },
  { href: '/report-diagnostic-starter-kit', icon: CircleDot, label: 'Starter kit', title: 'Find the first claim worth fixing.', detail: 'Use a focused worksheet to diagnose a real reporting moment.' },
  { href: '/guides/msp-client-reporting-qbr-metric-evidence', icon: FileText, label: 'Canonical guide', title: 'When a QBR metric needs evidence.', detail: 'Read the practical guide to turning a challenged metric into a bounded proof path.' },
] as const;

export default async function Home() {
  const manifest = await loadManifest(SAMPLE_REPORT_ID);
  const figureCount = manifest?.elements.length ?? 0;
  const evidenceRowCount = manifest?.elements.reduce((count, element) => count + element.evidence.table.rows.length, 0) ?? 0;

  return (
    <div className="signal-page">
      <section className="relative overflow-hidden bg-[var(--rd-surface-ink)] text-[var(--rd-on-ink)]">
        <div className="absolute inset-0 opacity-30 signal-grid-backdrop" aria-hidden="true" />
        <div className="absolute left-[53%] top-[-14rem] h-[38rem] w-[38rem] rounded-full bg-[var(--rd-signal)]/20 blur-3xl" aria-hidden="true" />
        <div className="signal-wrap relative grid gap-12 pb-20 pt-16 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:pb-28 lg:pt-24">
          <div className="max-w-3xl signal-reveal">
            <p className="signal-label !text-[#b9c8ff]"><span className="sr-only">RipoDoc: </span>Controlled evidence delivery</p>
            <h1 className="signal-display mt-7 text-[clamp(3.1rem,6.2vw,6.35rem)]">Make one report claim <span className="text-[#9bb3ff]">answerable.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--rd-on-ink-soft)] sm:text-xl">RipoDoc keeps the client report concise, then gives a selected number an approved evidence path—narrow, recipient-aware, time-bound, and reviewable.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/founding-partners" className="signal-button !w-auto !bg-white !text-[var(--rd-ink)] hover:!bg-[var(--rd-signal-soft)]">
                Qualify a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="#sample-report" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white">
                Inspect a fixture claim <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/15 pt-5 text-sm text-[var(--rd-on-ink-soft)]">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#9bb3ff]" aria-hidden="true" /> No customer report data on this site</span>
              <span className="inline-flex items-center gap-2"><Braces className="h-4 w-4 text-[#9bb3ff]" aria-hidden="true" /> Open-source, self-hostable path</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div className="signal-hero-image relative aspect-[16/10]">
              <Image src="/signal-ledger-hero.png" alt="Abstract layered evidence sheets connected by a cobalt provenance path" fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
              <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/18 bg-[rgb(16_24_39_/_0.78)] p-4 backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-5">
                <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[0.65rem] font-bold uppercase tracking-[.12em] text-[#9bb3ff]">Evidence path</p><p className="mt-1 text-base font-semibold text-white">One selected claim, not a broad client-data export.</p></div><span className="signal-status bg-white/10 text-[#dbe5ff]">Fixture model</span></div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center"><Metric label="Claim" value="01" /><Metric label="Scope" value="Bounded" /><Metric label="Review" value="Required" /></div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-[var(--rd-line)] bg-white p-4 shadow-[0_16px_32px_rgb(0_0_0_/_0.22)] md:block"><p className="font-mono text-[0.62rem] font-bold uppercase tracking-[.12em] text-[var(--rd-ink-faint)]">Reader condition</p><p className="mt-1 text-sm font-semibold text-[var(--rd-ink)]">Named recipient + expiry</p></div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--rd-line)] bg-white">
        <div className="signal-wrap grid gap-px bg-[var(--rd-line)] sm:grid-cols-3">
          <ProofStrip title="Keep the report familiar" detail="A client still reads the concise PDF or report they expect." />
          <ProofStrip title="Answer one question precisely" detail="Evidence is scoped to the approved claim, not a data dump." />
          <ProofStrip title="Show the decision boundary" detail="Reader, timing, and reviewer are part of the delivery path." />
        </div>
      </section>

      <section className="bg-[var(--rd-canvas)] py-20 sm:py-28 lg:py-36">
        <div className="signal-wrap grid gap-12 lg:grid-cols-[.76fr_1.24fr] lg:items-end">
          <div><p className="signal-label">The operating record</p><h2 className="signal-section-title mt-5 text-5xl sm:text-6xl">A small evidence system is better than a bigger report.</h2></div>
          <p className="signal-copy">When a client asks about a report number, the conversation should not trigger a spreadsheet chase or a broad portal login. RipoDoc defines the smallest useful proof decision before anything is shared.</p>
        </div>
        <div className="signal-wrap mt-12 overflow-hidden rounded-[1.25rem] border border-[var(--rd-line)] bg-[var(--rd-line)] sm:mt-16">
          <div className="grid gap-px sm:grid-cols-2 xl:grid-cols-5">{recordFields.map(({ number, title, detail, icon: Icon }) => <article key={number} className="min-h-64 bg-white p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><span className="font-mono text-xs font-bold tracking-[.12em] text-[var(--rd-signal)]">{number}</span><Icon className="h-5 w-5 text-[var(--rd-ink-faint)]" aria-hidden="true" /></div><h3 className="mt-14 text-xl font-semibold tracking-[-.035em] text-[var(--rd-ink)]">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--rd-ink-soft)]">{detail}</p></article>)}</div>
        </div>
        <div className="signal-wrap mt-6 flex flex-col gap-4 border-t border-[var(--rd-line)] pt-6 text-sm leading-6 text-[var(--rd-ink-soft)] sm:flex-row sm:items-center sm:justify-between"><p className="max-w-3xl">This is not a compliance score or a generic AI feature. It is a repeatable publication decision for one client-report moment.</p><Link href="/how-it-works" className="signal-link inline-flex shrink-0 items-center gap-2">Read the method <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </section>

      <section id="sample-report" className="scroll-mt-24 bg-white py-20 sm:py-28 lg:py-36">
        <div className="signal-wrap grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28"><p className="signal-label">Fixture evidence sample</p><h2 className="signal-section-title mt-5 text-5xl sm:text-6xl">Inspect the boundary before you trust the promise.</h2><p className="signal-copy mt-6">This live sample uses fixture data. It demonstrates the interaction principle: a selected figure opens a bounded evidence view rather than exposing a general report warehouse.</p><div className="mt-8 grid max-w-md grid-cols-3 gap-2"><Stat value={figureCount.toString()} label="figures" /><Stat value={evidenceRowCount.toString()} label="sample rows" /><Stat value="0" label="PDF rows" /></div></div>
          <div className="signal-panel overflow-hidden p-3 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rd-line)] pb-4"><div><p className="font-mono text-[.64rem] font-bold uppercase tracking-[.12em] text-[var(--rd-signal)]">Interactive fixture</p><p className="mt-1 text-sm font-semibold text-[var(--rd-ink)]">Select a report claim. Inspect its boundary.</p></div><span className="signal-status bg-[var(--rd-signal-soft)] text-[var(--rd-signal)]">No customer data</span></div>{manifest ? <SampleReport manifest={manifest} /> : <DemoUnavailable />}</div>
        </div>
      </section>

      <section className="bg-[var(--rd-surface-ink)] py-20 text-[var(--rd-on-ink)] sm:py-28">
        <div className="signal-wrap grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center"><div><p className="signal-label !text-[#b9c8ff]">For the first real report</p><h2 className="signal-section-title mt-5 max-w-3xl text-5xl text-white sm:text-6xl">Do not start with an integration. Start with one challenged claim.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--rd-on-ink-soft)]">RipoDoc is looking for MSPs that can name the last report metric a client questioned, describe the workaround, and decide whether a bounded evidence path would actually improve the conversation.</p><Link href="/for-msps" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[var(--rd-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--rd-signal-soft)]">See if your workflow fits <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div><div className="rounded-2xl border border-white/16 bg-white/5 p-2"><div className="rounded-xl border border-white/12 bg-[var(--rd-surface-ink-raised)] p-5 sm:p-7"><p className="font-mono text-[.65rem] font-bold uppercase tracking-[.12em] text-[#9bb3ff]">Diagnostic entry criteria</p><div className="mt-6 space-y-4">{['A real recurring client report', 'One report claim that was questioned', 'A reviewed source or mapping behind the claim', 'A report owner who can evaluate the outcome'].map((item, index) => <div key={item} className="flex gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"><span className="font-mono text-sm text-[#9bb3ff]">0{index + 1}</span><p className="text-sm leading-6 text-white/85">{item}</p></div>)}</div></div></div></div>
      </section>

      <section className="bg-[var(--rd-canvas-alt)] py-20 sm:py-28 lg:py-36">
        <div className="signal-wrap flex flex-col gap-8 border-b border-[var(--rd-line)] pb-10 lg:flex-row lg:items-end lg:justify-between"><div><p className="signal-label">Work before the sales call</p><h2 className="signal-section-title mt-5 text-5xl sm:text-6xl">Useful resources. No report upload required.</h2></div><p className="signal-copy text-base">Use the public tools to decide whether a specific reporting workflow has an evidence-delivery problem worth solving.</p></div>
        <div className="signal-wrap mt-8 grid gap-4 lg:grid-cols-3">{resources.map(({ href, icon: Icon, label, title, detail }) => <Link key={href} href={href} className="signal-card group min-h-64 p-6 transition hover:-translate-y-1 hover:border-[var(--rd-signal)] hover:shadow-[0_18px_34px_rgb(16_24_39_/_0.11)]"><Icon className="h-5 w-5 text-[var(--rd-signal)]" aria-hidden="true" /><p className="mt-10 font-mono text-[.64rem] font-bold uppercase tracking-[.12em] text-[var(--rd-ink-faint)]">{label}</p><h3 className="mt-3 text-xl font-semibold tracking-[-.035em] text-[var(--rd-ink)]">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--rd-ink-soft)]">{detail}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--rd-signal)]">Open resource <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></span></Link>)}</div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { readonly label: string; readonly value: string }) { return <div className="rounded-lg border border-white/10 bg-black/10 px-2 py-3"><p className="font-mono text-[.6rem] font-bold uppercase tracking-[.1em] text-white/55">{label}</p><p className="mt-1 text-xs font-semibold text-white">{value}</p></div>; }
function ProofStrip({ title, detail }: { readonly title: string; readonly detail: string }) { return <article className="bg-white p-6 sm:p-7"><p className="font-mono text-[.64rem] font-bold uppercase tracking-[.12em] text-[var(--rd-signal)]">Evidence delivery</p><h2 className="mt-3 text-lg font-semibold tracking-[-.03em] text-[var(--rd-ink)]">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--rd-ink-soft)]">{detail}</p></article>; }
function Stat({ value, label }: { readonly value: string; readonly label: string }) { return <div className="rounded-xl border border-[var(--rd-line)] bg-white p-3"><p className="font-mono text-xl font-bold tracking-[-.06em] text-[var(--rd-ink)]">{value}</p><p className="mt-1 text-[.62rem] font-bold uppercase tracking-[.1em] text-[var(--rd-ink-faint)]">{label}</p></div>; }
function DemoUnavailable() { return <div className="mt-4 rounded-xl border border-[var(--rd-warning)] bg-[var(--rd-warning-soft)] p-5 text-sm leading-6 text-[#653a0d]"><p className="font-semibold">The interactive fixture is not available in this runtime.</p><p className="mt-2">You can still inspect the method, self-hosting path, and published controls.</p></div>; }
