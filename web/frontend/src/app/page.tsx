import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  FileCheck2,
  FileSearch,
  LockKeyhole,
  Send,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { DeferredSampleReport } from '@/components/marketing/DeferredSampleReport.tsx';

export const metadata: Metadata = {
  title: 'RipoDoc — make every report claim answerable',
  description: 'RipoDoc helps MSP teams deliver the exact approved evidence behind a client report claim—reviewed, recipient-aware, time-bound, and revocable.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'RipoDoc — make every report claim answerable',
    description: 'Give a client the approved evidence behind a report claim without sending a broader export or another portal login.',
    url: '/',
  },
};

const DEMO_FIGURE_COUNT = 6;
const DEMO_EVIDENCE_ROW_COUNT = 450;

const steps: readonly { readonly number: string; readonly title: string; readonly detail: string; readonly icon: LucideIcon }[] = [
  { number: '01', title: 'Choose the claim', detail: 'Start with the report figure a client actually needs explained.', icon: FileSearch },
  { number: '02', title: 'Approve the evidence', detail: 'Review the supporting rows, source, scope, reader, and expiry before anything is shared.', icon: FileCheck2 },
  { number: '03', title: 'Deliver a controlled answer', detail: 'The reader opens the approved proof view—not a larger export or a new portal.', icon: Send },
] as const;

const controls: readonly { readonly title: string; readonly detail: string; readonly icon: LucideIcon }[] = [
  { title: 'Only the needed evidence', detail: 'A proof view is scoped to one approved claim, rather than an entire customer dataset.', icon: FileSearch },
  { title: 'A deliberate reader', detail: 'Access can be bound to the intended recipient instead of relying on a forwarded link.', icon: UsersRound },
  { title: 'A visible decision window', detail: 'Evidence can expire or be revoked when the report moment has passed.', icon: Clock3 },
  { title: 'A receipt you can inspect', detail: 'The delivery record keeps source, review, scope, and access posture visible.', icon: ShieldCheck },
] as const;

export default function Home() {
  return <main className="clear-page">
    <section className="clear-hero">
      <div className="clear-wrap clear-hero-grid">
        <div className="clear-hero-copy">
          <p className="clear-eyebrow"><span aria-hidden="true" /> Evidence delivery for MSP report teams</p>
          <h1>Make every report claim <span>answerable.</span></h1>
          <p className="clear-lede">RipoDoc lets MSPs give clients the exact approved evidence behind a QBR, monthly, security, or executive report claim—without sending a broader export or another portal login.</p>
          <div className="clear-actions">
            <Link href="#sample-report" className="clear-button clear-button-primary">See a live example <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/founding-partners" className="clear-text-link">Open a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <p className="clear-hero-note"><LockKeyhole className="h-4 w-4" aria-hidden="true" /> Your reporting stack stays in place. RipoDoc controls the proof handoff after a claim needs an answer.</p>
        </div>
        <ProofPreview />
      </div>
    </section>

    <section className="clear-proof-strip" aria-label="What RipoDoc controls">
      <div className="clear-wrap clear-proof-strip-grid">
        <p><Check className="h-4 w-4" aria-hidden="true" /> Approved claim</p>
        <p><Check className="h-4 w-4" aria-hidden="true" /> Scoped evidence</p>
        <p><Check className="h-4 w-4" aria-hidden="true" /> Named delivery boundary</p>
        <p><Check className="h-4 w-4" aria-hidden="true" /> Reviewable receipt</p>
      </div>
    </section>

    <section className="clear-section clear-section-intro">
      <div className="clear-wrap clear-split-heading">
        <div>
          <p className="clear-eyebrow clear-eyebrow-blue"><span aria-hidden="true" /> Simple by design</p>
          <h2>A client question should not start a data chase.</h2>
        </div>
        <p>When a client asks where a report figure came from, the answer is often a bigger spreadsheet, another system login, or a meeting. RipoDoc keeps the report familiar and makes the supporting proof deliberate.</p>
      </div>
      <div className="clear-wrap clear-step-grid">
        {steps.map((step) => <StepCard key={step.number} {...step} />)}
      </div>
    </section>

    <section id="sample-report" className="clear-section clear-sample-section">
      <div className="clear-wrap">
        <div className="clear-sample-heading">
          <div>
            <p className="clear-eyebrow clear-eyebrow-blue"><span aria-hidden="true" /> Try the proof path</p>
            <h2>Open one report figure. See the approved answer behind it.</h2>
          </div>
          <p>This is safe fixture data. The interactive sample keeps supporting rows out of the PDF and opens only the evidence approved for the selected figure.</p>
        </div>
        <div className="clear-sample-layout">
          <aside className="clear-sample-guide">
            <p className="clear-small-label">What this example demonstrates</p>
            <ul>
              <li><Check className="h-4 w-4" aria-hidden="true" /> A familiar report stays concise.</li>
              <li><Check className="h-4 w-4" aria-hidden="true" /> A selected claim opens a narrow evidence view.</li>
              <li><Check className="h-4 w-4" aria-hidden="true" /> Delivery remains governed by review and access conditions.</li>
            </ul>
            <div className="clear-fixture-stats" aria-label="Sample fixture statistics">
              <div><strong>{DEMO_FIGURE_COUNT}</strong><span>approved figures</span></div>
              <div><strong>{DEMO_EVIDENCE_ROW_COUNT}</strong><span>fixture rows</span></div>
              <div><strong>0</strong><span>rows in PDF</span></div>
            </div>
          </aside>
          <div className="clear-sample-frame">
            <div className="clear-sample-frame-head"><div><p className="clear-small-label">RipoDoc sample report</p><p>Select a figure to open its approved evidence.</p></div><span>Fixture data</span></div>
            <DeferredSampleReport />
          </div>
        </div>
      </div>
    </section>

    <section className="clear-section clear-fit-section">
      <div className="clear-wrap clear-split-heading">
        <div>
          <p className="clear-eyebrow clear-eyebrow-blue"><span aria-hidden="true" /> Fits your stack</p>
          <h2>Keep the tools that build your report.</h2>
        </div>
        <p>RipoDoc begins after a report claim needs an answer. It does not ask you to replace the PSA, RMM, BI, QBR, documentation, or portal systems your team already uses.</p>
      </div>
      <div className="clear-wrap clear-fit-grid">
        <article><p className="clear-small-label">Your existing systems</p><h3>Build the report.</h3><p>PSA, RMM, BI, QBR, portal, and documentation tools continue to create the operational context.</p></article>
        <article className="clear-fit-highlight"><p className="clear-small-label">RipoDoc</p><h3>Controls the proof handoff.</h3><p>One approved claim connects to a reviewed source, a narrow evidence view, and a deliberate reader condition.</p></article>
        <article><p className="clear-small-label">Your client</p><h3>Gets a clear answer.</h3><p>The report stays readable. The supporting evidence is there when it is needed, and no broader export is assumed.</p></article>
      </div>
    </section>

    <section className="clear-section clear-controls-section">
      <div className="clear-wrap clear-controls-grid">
        <div className="clear-controls-copy"><p className="clear-eyebrow clear-eyebrow-mint"><span aria-hidden="true" /> A boundary people can understand</p><h2>Proof is more useful when its rules are visible.</h2><p>RipoDoc makes the decision around evidence inspectable: what claim is being answered, what source supports it, what detail is in scope, who may see it, and when access should stop.</p><Link href="/security" className="clear-text-link clear-text-link-light">Read the security boundary <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
        <div className="clear-control-card-grid">{controls.map((control) => <ControlCard key={control.title} {...control} />)}</div>
      </div>
    </section>

    <section className="clear-section clear-audience-section">
      <div className="clear-wrap">
        <div className="clear-centered-heading"><p className="clear-eyebrow clear-eyebrow-blue"><span aria-hidden="true" /> Built for the report moment</p><h2>Useful to the people who have to stand behind the number.</h2></div>
        <div className="clear-audience-grid">
          <AudienceCard title="MSP owners" detail="Show the work behind a value, risk, or performance claim without adding a new client portal." />
          <AudienceCard title="vCIO and client-success teams" detail="Keep the conversation in the report while making a challenged figure easy to answer." />
          <AudienceCard title="Security and reporting leads" detail="Deliver supporting evidence with a clear scope, reader condition, and review trail." />
        </div>
      </div>
    </section>

    <section className="clear-final-cta">
      <div className="clear-wrap clear-final-cta-inner">
        <div><p className="clear-eyebrow clear-eyebrow-blue"><span aria-hidden="true" /> Start with one report moment</p><h2>See whether a real client question has a better answer.</h2><p>The public site never asks you to upload a client report. Bring the scenario, not the data.</p></div>
        <div className="clear-final-actions"><Link href="/founding-partners" className="clear-button clear-button-primary">Open a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/download" className="clear-text-link">Explore self-hosting <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </div>
    </section>
  </main>;
}

function ProofPreview() {
  return <div className="clear-proof-preview" aria-label="Example controlled evidence delivery">
    <div className="clear-proof-preview-top"><span>Client report</span><span>QBR · Fixture</span></div>
    <div className="clear-claim-card"><p className="clear-small-label">Selected report claim</p><h2>Patch compliance reached <strong>98.6%</strong>.</h2><p>Client Operations Review · June 2026</p></div>
    <div className="clear-proof-path"><div><span className="clear-path-dot clear-path-dot-blue" /><div><strong>Evidence approved</strong><p>450 reviewed fixture rows support this figure.</p></div></div><div><span className="clear-path-dot clear-path-dot-mint" /><div><strong>Reader boundary set</strong><p>Access is named, time-bound, and revocable.</p></div></div><div><span className="clear-path-dot clear-path-dot-ink" /><div><strong>Receipt available</strong><p>Delivery posture remains visible after the report is sent.</p></div></div></div>
    <Link href="#sample-report" className="clear-proof-preview-link">Inspect the sample <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
  </div>;
}

function StepCard({ number, title, detail, icon: Icon }: { readonly number: string; readonly title: string; readonly detail: string; readonly icon: LucideIcon }) {
  return <article className="clear-step-card"><div className="clear-card-top"><span>{number}</span><Icon className="h-5 w-5" aria-hidden="true" /></div><h3>{title}</h3><p>{detail}</p></article>;
}

function ControlCard({ title, detail, icon: Icon }: { readonly title: string; readonly detail: string; readonly icon: LucideIcon }) {
  return <article><Icon className="h-5 w-5" aria-hidden="true" /><h3>{title}</h3><p>{detail}</p></article>;
}

function AudienceCard({ title, detail }: { readonly title: string; readonly detail: string }) {
  return <article className="clear-audience-card"><span aria-hidden="true" /><h3>{title}</h3><p>{detail}</p><Link href="/for-msps">Explore MSP fit <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article>;
}
