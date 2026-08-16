import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'MSP client reporting: when a QBR metric needs evidence',
  description: 'A practical MSP guide to keeping QBRs concise while making a selected SLA, ticket, patch, backup, or asset-risk claim explainable with reviewed, bounded evidence.',
  alternates: { canonical: '/guides/msp-client-reporting-qbr-metric-evidence' },
  openGraph: {
    title: 'MSP client reporting: when a QBR metric needs evidence | RipoDoc',
    description: 'Keep the QBR strategic. Make the material claim answerable with an approved, bounded evidence path.',
    url: '/guides/msp-client-reporting-qbr-metric-evidence',
  },
};

const fields = [
  ['Claim', 'What exact sentence, number, or chart result can the reader reasonably question?', '“SLA attainment was 97.4% in Q2.”'],
  ['Source', 'Which reviewed structured source or mapping gives that claim meaning?', 'A reviewed ticket export with client, period, severity, and SLA rules recorded.'],
  ['Scope', 'What is the smallest approved support set that answers this reader’s question?', 'Included rows, exclusions, denominator, period, and calculation note—not every ticket ever created.'],
  ['Reader', 'Who is the evidence intended for?', 'A named client executive or a defined recipient condition.'],
  ['Review', 'Who approved the claim, source context, evidence scope, and delivery condition?', 'The accountable vCIO, account manager, or designated reviewer.'],
] as const;

const metrics = [
  ['SLA attainment', 'Which tickets count, what did you exclude, and what period and time zone apply?'],
  ['Tickets resolved', 'Does this mean tickets closed, requests completed, or incidents resolved—and for which client entities?'],
  ['Patch compliance', 'Compliant with which policy and version? Which assets are offline, unsupported, or excepted?'],
  ['Backup verification', 'Does “verified” mean job success, a restore test, or another approved check?'],
  ['Assets at risk', 'Which lifecycle, warranty, risk, or exception rule produced the list?'],
] as const;

const faq = [
  {
    question: 'Does every QBR metric need a separate evidence view?',
    answer: 'No. Begin with the material claims that are regularly challenged or that drive a client decision. The aim is not to turn every report into a portal; it is to make a selected report claim answerable when it matters.',
  },
  {
    question: 'Can a PDF chart alone be treated as the evidence source?',
    answer: 'Not reliably. A defensible path needs a reviewed structured source or a documented mapping that explains the result, scope, calculation, and approval decision behind the chart.',
  },
  {
    question: 'Should a client receive the complete operational export after challenging one metric?',
    answer: 'Only if that broader release is appropriate for the reader and question. A material QBR question may need a much narrower approved support set, while an authorized operational audit may justify more detail.',
  },
  {
    question: 'What does RipoDoc replace?',
    answer: 'RipoDoc is designed to sit beside the systems that produce reports. It is not a replacement for a PSA, RMM, BI platform, general client portal, or the MSP’s own review responsibility.',
  },
] as const;

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': 'https://www.ripodoc.com/guides/msp-client-reporting-qbr-metric-evidence#article',
  headline: 'MSP client reporting: when a QBR metric needs evidence',
  description: 'A practical guide to keeping an MSP QBR concise while making a selected report claim explainable with reviewed, bounded evidence.',
  mainEntityOfPage: 'https://www.ripodoc.com/guides/msp-client-reporting-qbr-metric-evidence',
  publisher: { '@id': 'https://www.ripodoc.com/#organization' },
  about: { '@id': 'https://www.ripodoc.com/#software' },
  inLanguage: 'en-US',
};

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function MspClientReportingEvidenceGuide() {
  return (
    <div className="ledger-page bg-[#fffdf8] text-[#1d1a16]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData).replace(/</g, '\\u003c') }} />

      <section className="border-b border-[#1d1a16] bg-[radial-gradient(circle_at_82%_7%,rgba(239,214,107,.62),transparent_24%),radial-gradient(circle_at_11%_86%,rgba(61,85,179,.14),transparent_27%),#f6f0e5]">
        <div className="ledger-wrap py-14 sm:py-18 lg:py-24">
          <p className="ledger-kicker">Practical guide for MSP reporting teams</p>
          <div className="mt-5 grid gap-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,.9fr)] lg:items-end">
            <div className="min-w-0">
              <h1 className="max-w-5xl font-serif text-[clamp(2.7rem,7vw,5.5rem)] font-bold leading-[.9] tracking-[-.06em]">Keep the QBR strategic. Make the material claim answerable.</h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-[#4b463e] sm:text-xl">A client does not need a new portal to question one number in a report. They need a clear, reviewed explanation of the claim that affects the decision in front of them.</p>
            </div>
            <aside className="border border-[#1d1a16] bg-[#1d1a16] p-6 text-[#fffdf8] shadow-[6px_6px_0_#d9503b] sm:p-7">
              <FileCheck2 className="size-6 text-[#efd66b]" aria-hidden="true" />
              <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#efd66b]">The operating question</p>
              <p className="mt-3 text-xl font-bold tracking-[-.03em]">“Where did that number come from?”</p>
              <p className="mt-3 text-sm leading-6 text-white/70">The best answer is neither a vague assurance nor an unbounded export. It is the approved support for this claim, in this report, for this reader.</p>
            </aside>
          </div>
        </div>
      </section>

      <main>
        <section className="ledger-wrap py-14 sm:py-18 lg:py-24">
          <div className="grid gap-10 border-b border-[#cfc2ae] pb-12 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:items-end">
            <div>
              <p className="ledger-kicker">The report problem</p>
              <h2 className="mt-5 font-serif text-4xl font-bold leading-none tracking-[-.05em] sm:text-5xl">A QBR is not a data dump.</h2>
            </div>
            <div className="space-y-5 text-base leading-7 text-[#4b463e]">
              <p>Quarterly business reviews should help a client decide what matters next. Common MSP QBR guidance similarly emphasizes an outcome-oriented conversation rather than getting stuck in statistics. <a className="font-bold text-[#243a87] underline decoration-[#d9503b] underline-offset-4 hover:text-[#a62f26]" href="https://www.scalepad.com/blog/quarterly-business-reviews-qbr-action-plan" target="_blank" rel="noopener noreferrer">ScalePad</a> and <a className="font-bold text-[#243a87] underline decoration-[#d9503b] underline-offset-4 hover:text-[#a62f26]" href="https://www.connectwise.com/blog/8-best-practices-for-client-qbrs" target="_blank" rel="noopener noreferrer">ConnectWise</a> both describe the QBR as a strategic client conversation.</p>
              <p>Concise does not have to mean unanswerable. The moment a material SLA, ticket, patch, backup, or asset-risk claim is challenged, the MSP needs a support path that is as deliberate as the claim itself.</p>
            </div>
          </div>

          <div className="mt-10 grid border border-[#cfc2ae] bg-[#cfc2ae] md:grid-cols-2">
            <Comparison title="“I’ll send the spreadsheet.”" body="Delivers more detail later, but may not show which version is authoritative, which rows are in scope, or whether the reader should receive the complete export." />
            <Comparison title="“Log into the portal.”" body="Offers broader operational access, but may be disproportionate to one report question and can lose the specific QBR context." />
            <Comparison title="“Trust the report.”" body="Keeps the meeting concise, but leaves a reasonable client question unanswered." />
            <Comparison emphasis title="“Here is the approved support for this claim.”" body="Preserves the report while keeping the source, scope, reader, and review decision visible and bounded." />
          </div>
        </section>

        <section className="border-y border-[#1d1a16] bg-[#e9dfcf]">
          <div className="ledger-wrap py-14 sm:py-18 lg:py-24">
            <div className="max-w-3xl">
              <p className="ledger-kicker">The publication decision</p>
              <h2 className="mt-5 font-serif text-4xl font-bold leading-none tracking-[-.05em] sm:text-5xl">The five fields behind an answerable claim.</h2>
              <p className="mt-5 text-base leading-7 text-[#4b463e]">If a team cannot state these five fields, the missing ingredient is usually not a link. The claim may be vague, the source may not be ready, the scope may be too broad, or no one may have made the delivery decision.</p>
            </div>
            <div className="mt-10 grid gap-px border border-[#1d1a16] bg-[#1d1a16] md:grid-cols-2 xl:grid-cols-5">
              {fields.map(([title, question, example], index) => (
                <article key={title} className="min-w-0 bg-[#fffdf8] p-6">
                  <span className="font-mono text-xs font-bold tracking-[.14em] text-[#3d55b3]">0{index + 1}</span>
                  <h3 className="mt-8 text-xl font-bold tracking-[-.035em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#4b463e]">{question}</p>
                  <p className="mt-5 border-l-2 border-[#d9503b] pl-3 text-xs leading-5 text-[#665f56]">{example}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ledger-wrap py-14 sm:py-18 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)]">
            <div>
              <p className="ledger-kicker">Worked fixture-data example</p>
              <h2 className="mt-5 font-serif text-4xl font-bold leading-none tracking-[-.05em] sm:text-5xl">An SLA percentage needs more than a chart screenshot.</h2>
              <p className="mt-6 text-base leading-7 text-[#4b463e]">The sample below uses fixture data, not a customer deployment. The exact contract, source-system configuration, and client context determine an MSP’s actual reporting rules.</p>
            </div>
            <div className="border border-[#1d1a16] bg-[#f6f0e5] p-6 sm:p-8">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.15em] text-[#3d55b3]">QBR statement</p>
              <p className="mt-4 font-serif text-3xl font-bold leading-[.98] tracking-[-.045em]">“SLA attainment was 97.4% for Harbourview Legal in Q2.”</p>
              <div className="mt-8 grid gap-5 border-t border-[#cfc2ae] pt-6 sm:grid-cols-2">
                <EvidenceStep title="Make the claim precise" body="Name the client, reporting period, included unit of analysis, and any material rule behind the calculation." />
                <EvidenceStep title="Identify the reviewed source" body="Use a reviewed structured dataset or documented mapping—not a visual PDF chart as a substitute for rows and semantics." />
                <EvidenceStep title="Bound the evidence" body="Include the period, inclusion/exclusion criteria, numerator, denominator, and the approved support appropriate to the reader." />
                <EvidenceStep title="Record delivery and review" body="Name the intended reader, access condition, reviewer, and publication decision before the report is sent." />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#1d1a16] bg-[#3d55b3] text-white">
          <div className="ledger-wrap py-14 sm:py-18 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,.74fr)_minmax(0,1.26fr)] lg:items-end">
              <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#efd66b]">Where to start</p><h2 className="mt-5 font-serif text-4xl font-bold leading-none tracking-[-.05em] sm:text-5xl">Choose the claims that change a client decision.</h2></div>
              <p className="max-w-3xl text-base leading-7 text-white/80">These are question patterns, not universal calculation definitions. The service agreement, client context, and system-of-record rules still determine what a metric means.</p>
            </div>
            <div className="mt-10 grid border border-white/30 bg-white/20 md:grid-cols-2 xl:grid-cols-5">
              {metrics.map(([metric, question]) => <article key={metric} className="min-w-0 border-b border-white/20 bg-[#3d55b3] p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 xl:border-r xl:last:border-r-0"><CheckCircle2 className="size-5 text-[#efd66b]" aria-hidden="true" /><h3 className="mt-8 text-xl font-bold tracking-[-.03em]">{metric}</h3><p className="mt-3 text-sm leading-6 text-white/75">{question}</p></article>)}
            </div>
          </div>
        </section>

        <section className="ledger-wrap py-14 sm:py-18 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]">
            <div><p className="ledger-kicker">Five-minute teardown</p><h2 className="mt-5 font-serif text-4xl font-bold leading-none tracking-[-.05em] sm:text-5xl">Test one report claim before proposing a platform project.</h2><p className="mt-6 text-base leading-7 text-[#4b463e]">Use the sequence to decide whether a specific evidence workflow is worth validating. It is not a claim of compliance, a generic transformation promise, or a reason to upload customer data to a public demo.</p></div>
            <ol className="border-y border-[#cfc2ae]">
              {['Which client-facing number is regularly challenged?', 'What reviewed structured source or mapping supports it?', 'What does the reader need to see—and not need to see?', 'Who should inspect it, and what access condition makes sense?', 'Who reviews and approves the path before delivery?'].map((item, index) => <li key={item} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 border-b border-[#cfc2ae] py-5 last:border-b-0"><span className="font-mono text-sm font-bold text-[#3d55b3]">0{index + 1}</span><span className="text-base font-bold leading-6">{item}</span></li>)}
            </ol>
          </div>
        </section>

        <section className="border-y border-[#1d1a16] bg-[#f6f0e5]">
          <div className="ledger-wrap grid gap-10 py-14 sm:py-18 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:py-24">
            <div><p className="ledger-kicker">Common questions</p><h2 className="mt-5 font-serif text-4xl font-bold leading-none tracking-[-.05em] sm:text-5xl">Answer the question without widening the data boundary.</h2></div>
            <div className="divide-y divide-[#cfc2ae] border-y border-[#cfc2ae]">{faq.map((item) => <article key={item.question} className="py-6"><h3 className="text-lg font-bold tracking-[-.025em]">{item.question}</h3><p className="mt-3 text-sm leading-7 text-[#4b463e]">{item.answer}</p></article>)}</div>
          </div>
        </section>

        <section className="border-b border-[#1d1a16] bg-[#efd66b]">
          <div className="ledger-wrap grid gap-8 py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,.85fr)] lg:items-end">
            <div><ShieldCheck className="size-6 text-[#243a87]" aria-hidden="true" /><p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#243a87]">No-data next step</p><h2 className="mt-3 font-serif text-4xl font-bold leading-none tracking-[-.05em]">Start with a claim you can name.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#4b463e]">Use the no-data report diagnostic starter kit to decide whether one real report claim has a clear source, scope, reader, reviewer, and delivery boundary. Do not paste customer data, credentials, report files, PHI/ePHI, or sensitive operational details into a public form.</p></div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Link href="/report-diagnostic-starter-kit" className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#1d1a16] bg-[#1d1a16] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_#d9503b] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Use the report diagnostic kit <ArrowRight className="size-4" aria-hidden="true" /></Link><Link href="/for-msps" className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#1d1a16] bg-[#fffdf8] px-5 py-3 text-sm font-bold">Inspect the MSP sample <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Comparison({ title, body, emphasis = false }: { readonly title: string; readonly body: string; readonly emphasis?: boolean }) {
  return <article className={`min-w-0 p-6 sm:p-7 ${emphasis ? 'bg-[#fff4dc]' : 'bg-[#fffdf8]'}`}><h3 className="text-xl font-bold tracking-[-.03em]">{title}</h3><p className="mt-4 text-sm leading-7 text-[#4b463e]">{body}</p></article>;
}

function EvidenceStep({ title, body }: { readonly title: string; readonly body: string }) {
  return <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#d9503b]">{title}</p><p className="mt-2 text-sm leading-6 text-[#4b463e]">{body}</p></div>;
}
