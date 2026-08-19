import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BadgeCheck, CheckCircle2, Clock3, LockKeyhole, Network, ShieldCheck } from 'lucide-react';
import { EvidenceControlRoom } from '@/components/marketing/EvidenceControlRoom.tsx';
import { FixtureReportDesk } from '@/components/marketing/FixtureReportDesk.tsx';

export const metadata: Metadata = {
  title: 'RipoDoc — controlled proof delivery for MSP report claims',
  description: 'RipoDoc gives MSP teams a controlled, inspectable answer behind a material client-report claim: reviewed source, narrow evidence, deliberate reader, time condition, and visible delivery receipt.',
  alternates: { canonical: '/' },
  openGraph: { title: 'RipoDoc — controlled proof delivery', description: 'Show the approved answer behind a material report claim without sending a broader export or forcing a portal project.', url: '/' },
};

const LAYERS = [
  { name: 'Reporting system', does: 'Creates QBRs, executive reports, dashboards, and the operational context.', doesNot: 'Does not control the answer after one claim is challenged.', color: 'blue' },
  { name: 'Client portal', does: 'Provides ongoing self-service, tickets, resources, and relationship visibility.', doesNot: 'Does not need to be the default route for one report question.', color: 'amber' },
  { name: 'Source and documentation', does: 'Holds technical records, raw data, assets, and supporting context.', doesNot: 'Does not automatically define the approved reader-safe evidence set.', color: 'mint' },
  { name: 'RipoDoc', does: 'Controls one material claim’s approved evidence path and its delivery posture.', doesNot: 'Does not replace the systems that produce, store, or report operational data.', color: 'violet' },
] as const;

const ROLES = [
  { title: 'MSP owner', signal: 'VALUE VISIBLE', detail: 'Make the evidence behind a strategic statement as easy to stand behind as the statement itself.', outcome: 'Move from “we did the work” to a client-visible answer.' },
  { title: 'vCIO / client success', signal: 'CONVERSATION INTACT', detail: 'Keep the executive discussion in the report and open depth only when the figure needs it.', outcome: 'Avoid turning a review meeting into a search across tools.' },
  { title: 'Operations / security', signal: 'HANDOFF CONTROLLED', detail: 'Define source, scope, reader, review, expiry, and delivery posture before the answer leaves the team.', outcome: 'Avoid rebuilding a defensible answer after it has already been sent.' },
] as const;

export default function Home() {
  return <main className="dense-page">
    <EvidenceControlRoom />
    <section className="dense-intro"><div><p className="dense-kicker">THE PRODUCT CATEGORY</p><h2>RipoDoc is the controlled handoff between a report figure and the person who needs to trust it.</h2></div><div><p>Modern MSP stacks already create reports, dashboards, documentation, portals, and operational data. The missing product moment is narrower: a material figure gets questioned, and the team needs to give the right reader the exact approved answer without exposing a broader export or sending them into another system.</p><div className="dense-intro-signals"><span><BadgeCheck className="h-4 w-4" aria-hidden="true" /> review is visible</span><span><LockKeyhole className="h-4 w-4" aria-hidden="true" /> scope is explicit</span><span><Clock3 className="h-4 w-4" aria-hidden="true" /> access has a condition</span></div></div></section>
    <FixtureReportDesk />
    <section className="dense-boundary"><header><p className="dense-kicker">NOT ANOTHER PORTAL OR DATA LAKE</p><h2>Keep every system that does its job. Make the proof handoff do its job.</h2><p>RipoDoc is deliberately narrow. That is what makes its delivery conditions visible, reviewable, and easier to explain to a client.</p></header><div className="dense-boundary-grid">{LAYERS.map((layer, index) => <article key={layer.name} className={`boundary-${layer.color}`}><span>0{index + 1} / SYSTEM LAYER</span><h3>{layer.name}</h3><div><b>DOES</b><p>{layer.does}</p></div><div><b>DOES NOT</b><p>{layer.doesNot}</p></div></article>)}</div></section>
    <section className="dense-lifecycle"><div className="dense-lifecycle-copy"><p className="dense-kicker">FROM CLAIM TO ACCOUNTABILITY</p><h2>A proof path is an operating sequence, not a static link.</h2><p>Each step stays visible in the product experience, so an MSP can explain what is being answered, what supports it, who may see it, and what happens after delivery.</p><Link href="/how-it-works" className="dense-action dense-action-secondary">Walk the proof route <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div><ol>{[['01', 'Select the material claim', 'Start with the statement that changes a client decision.'], ['02', 'Approve the supporting evidence', 'Confirm source, period, scope, and reviewer before release.'], ['03', 'Set the reader condition', 'Name the recipient or delivery context and the access window.'], ['04', 'Deliver the answer', 'The reader sees the proof experience—not a broader export.'], ['05', 'Keep the receipt visible', 'The delivery posture remains an inspectable product record.']].map(([number, title, detail]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{detail}</p></div><i aria-hidden="true" /></li>)}</ol></section>
    <section className="dense-roles"><header><p className="dense-kicker">WHO NEEDS THE ANSWER TO HOLD UP?</p><h2>Different roles share one controlled proof system.</h2></header><div>{ROLES.map((role) => <article key={role.title}><span>{role.signal}</span><h3>{role.title}</h3><p>{role.detail}</p><strong>{role.outcome}</strong></article>)}</div></section>
    <section className="dense-final"><div><p className="dense-kicker">START WITH ONE REAL REPORT MOMENT</p><h2>Do not upload client data. Bring the question the client is likely to ask.</h2><p>A report diagnostic begins with the operating scenario, not a sensitive client export. We will assess whether a controlled evidence-delivery path belongs after the report you already create.</p><div><Link href="/founding-partners" className="dense-action dense-action-primary">Open a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/report-evidence-readiness" className="dense-action dense-action-secondary">Run the evidence-readiness check <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div><aside><Network className="h-8 w-8" aria-hidden="true" /><span>PUBLIC PRODUCT BOUNDARY</span><ul><li><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Safe fixture data only</li><li><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> No public authoring</li><li><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> No client report uploads</li><li><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> No private repository access</li></ul><Link href="/security">Review trust architecture <ShieldCheck className="h-4 w-4" aria-hidden="true" /></Link></aside></section>
  </main>;
}
