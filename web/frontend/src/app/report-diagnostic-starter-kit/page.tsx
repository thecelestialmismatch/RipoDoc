import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, ClipboardCheck, FileCheck2, ShieldCheck, type LucideIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'MSP report diagnostic starter kit',
  description: 'Use five no-data questions to decide whether an MSP client-report metric needs a controlled evidence path before you add another dashboard or send a broader export.',
  alternates: { canonical: '/report-diagnostic-starter-kit' },
  openGraph: {
    title: 'MSP report diagnostic starter kit | RipoDoc',
    description: 'A no-data worksheet for the report moment when a client asks where a metric came from.',
    url: '/report-diagnostic-starter-kit',
  },
};

const questions: readonly { readonly number: string; readonly title: string; readonly prompt: string; readonly goodAnswer: string; readonly icon: LucideIcon }[] = [
  { number: '01', title: 'Name the claim', prompt: 'Write one sentence or number in a report that a client could reasonably question.', goodAnswer: 'The statement is specific enough to be true or false, not a vague reporting theme.', icon: FileCheck2 },
  { number: '02', title: 'Name the reviewed source', prompt: 'Identify the approved structured source or mapping that gives the claim meaning.', goodAnswer: 'A reviewer can point to a CSV, API response, or controlled mapping—not only a visual PDF chart.', icon: ClipboardCheck },
  { number: '03', title: 'Set the smallest useful scope', prompt: 'Describe the minimum supporting detail the reader needs to evaluate this one claim.', goodAnswer: 'The answer is narrower than a full spreadsheet, unrestricted export, or generic portal account.', icon: ShieldCheck },
  { number: '04', title: 'Name the reader and decision', prompt: 'State who should inspect the evidence, what they need to decide, and when access should end.', goodAnswer: 'The delivery condition is intentional; a forwarded report is not treated as blanket authorization.', icon: Check },
  { number: '05', title: 'Name the reviewer', prompt: 'Identify the person or role accountable for approving the claim, scope, and client-facing proof path.', goodAnswer: 'Someone owns the publication decision before detail reaches the reader.', icon: ClipboardCheck },
] as const;

const fitSignals = [
  'A recurring QBR, monthly service report, security report, or board-style update already exists.',
  'A client, prospect, executive, or insurer has asked how a selected metric was determined.',
  'The current answer becomes a spreadsheet, screenshot, wider portal access, or manual data chase.',
  'A reviewed structured source can support the selected claim.',
  'A report owner and reviewer can decide what the intended reader should receive.',
] as const;

export default function ReportDiagnosticStarterKitPage() {
  return (
    <main className="ledger-field text-[#1d1a16]">
      <section className="ledger-hero border-b border-[#1d1a16]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:py-24">
          <div className="max-w-3xl">
            <p className="ledger-kicker">MSP report diagnostic starter kit</p>
            <h1 className="ledger-display mt-6 text-6xl leading-[0.88] sm:text-7xl">Before you send more data, test the claim.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5f594f]">Use five questions to decide whether one client-report metric needs a controlled proof path—or whether your existing reporting workflow already gives the right answer.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#worksheet" className="inline-flex min-h-12 items-center gap-2 border border-[#1d1a16] bg-[#d9503b] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_#1d1a16] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Use the five questions <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
              <Link href="/#sample-report" className="inline-flex min-h-12 items-center gap-2 border border-[#1d1a16] bg-[#fffdf8] px-5 py-3 text-sm font-bold transition hover:bg-[#efd66b]">Inspect the claim sample <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <p className="ledger-margin-line mt-7 max-w-xl pl-4 text-sm leading-6 text-[#5f594f]">This is a no-data preparation tool. Do not paste client names, credentials, report files, evidence rows, PHI/ePHI, or other sensitive production information into the public site.</p>
          </div>
          <aside className="ledger-panel p-6 sm:p-8">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#3d55b3]">The decision it supports</p>
            <h2 className="ledger-display mt-4 text-4xl leading-[0.95]">Is this a report problem—or an evidence-boundary problem?</h2>
            <div className="mt-7 space-y-0 border-y border-[#cfc2ae]">
              <DecisionRow mark="A" title="Keep the current workflow" body="Choose this if the existing report, portal or filtered export already gives the intended reader an appropriate answer." />
              <DecisionRow mark="B" title="Improve the report itself" body="Choose this if the claim is vague, the source is unclear, or the business context is missing before any evidence is delivered." />
              <DecisionRow mark="C" title="Test controlled evidence delivery" body="Choose this only when a selected approved claim needs reviewed, least-data support for a specific reader." />
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid gap-8 border-b border-[#cfc2ae] pb-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div><p className="ledger-kicker">Fit check</p><h2 className="ledger-display mt-4 text-5xl leading-[0.94] sm:text-6xl">Start with one report your client already understands.</h2></div>
          <p className="max-w-2xl text-base leading-7 text-[#5f594f]">This starter kit is not an assessment score and it does not certify security or compliance. It helps a report owner decide whether a real client question is specific enough to test.</p>
        </div>
        <ul className="grid border-b border-[#cfc2ae] md:grid-cols-2">
          {fitSignals.map((signal, index) => <li key={signal} className="flex gap-4 border-r border-t border-[#cfc2ae] bg-[#fffdf8] px-7 py-7 even:border-r-0 md:px-9"><span className="font-mono text-xs font-bold tracking-[0.15em] text-[#3d55b3]">0{index + 1}</span><p className="max-w-lg text-sm leading-7 text-[#5f594f]">{signal}</p></li>)}
        </ul>
      </section>

      <section id="worksheet" className="border-y border-[#1d1a16] bg-[#e9dfcf] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl"><p className="ledger-kicker">Five-question worksheet</p><h2 className="ledger-display mt-4 text-5xl leading-[0.94] sm:text-6xl">Write the answer on your side of the boundary.</h2><p className="mt-5 text-base leading-7 text-[#5f594f]">Use an approved or redacted example internally. The purpose is to reveal whether the client needs a selected proof path, not to turn every report into a data room.</p></div>
          <div className="mt-12 grid border border-[#1d1a16] bg-[#1d1a16] lg:grid-cols-5">
            {questions.map(({ number, title, prompt, goodAnswer, icon: Icon }) => <article key={number} className="border-b border-[#1d1a16] bg-[#fffdf8] p-6 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"><span className="font-mono text-xs font-bold tracking-[0.16em] text-[#3d55b3]">{number}</span><Icon className="mt-7 h-5 w-5 text-[#d9503b]" aria-hidden="true" /><h3 className="mt-5 text-xl font-bold tracking-[-0.04em]">{title}</h3><p className="mt-3 text-sm leading-7 text-[#5f594f]">{prompt}</p><p className="mt-5 border-t border-[#cfc2ae] pt-4 text-xs leading-6 text-[#243a87]"><strong className="font-mono uppercase tracking-[0.1em]">Good signal</strong><br />{goodAnswer}</p></article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_0.95fr] lg:py-20">
        <article><p className="ledger-kicker">Read the result honestly</p><h2 className="ledger-display mt-4 text-5xl leading-[0.94] sm:text-6xl">A narrow answer is not always the right answer.</h2><div className="mt-7 space-y-5 text-base leading-7 text-[#5f594f]"><p>If the claim is vague, fix the report before you add any evidence path. If the source is not reviewed and structured, do not pretend that a visual PDF can become defensible proof. If the client needs broad, ongoing self-service access, use the portal or reporting system that is designed for that job.</p><p>RipoDoc becomes relevant only when the report is already doing its executive job, while one selected claim needs a bounded, reviewable answer for a deliberate reader.</p></div></article>
        <aside className="ledger-panel ledger-panel--ink p-7 sm:p-8"><ShieldCheck className="h-6 w-6 text-[#efd66b]" aria-hidden="true" /><p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#efd66b]">Next inspection point</p><h2 className="ledger-display mt-3 text-4xl leading-[0.95]">See the proof experience before you change the workflow.</h2><p className="mt-4 text-sm leading-7 text-white/70">The public sample uses fixture data. The self-hosted route is for operators who can own the production prerequisites and data boundary.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/#sample-report" className="inline-flex min-h-11 items-center border border-[#efd66b] bg-[#efd66b] px-4 py-2.5 text-sm font-bold text-[#1d1a16] transition hover:bg-white">Open claim sample</Link><Link href="/download" className="inline-flex min-h-11 items-center border border-white/40 px-4 py-2.5 text-sm font-bold text-white transition hover:border-white">Review self-hosting</Link></div></aside>
      </section>
    </main>
  );
}

function DecisionRow({ mark, title, body }: { readonly mark: string; readonly title: string; readonly body: string }) {
  return <div className="grid grid-cols-[38px_1fr] gap-4 border-b border-[#cfc2ae] py-5 last:border-b-0"><span className="flex h-9 w-9 items-center justify-center border border-[#1d1a16] bg-[#efd66b] text-xs font-bold">{mark}</span><div><h3 className="font-bold tracking-[-0.02em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#5f594f]">{body}</p></div></div>;
}
