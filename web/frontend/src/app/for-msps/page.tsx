import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, FileSearch, LockKeyhole, Presentation, ScanSearch, ShieldCheck, UsersRound } from 'lucide-react';

export const metadata: Metadata = {
  title: 'For MSPs | Keep QBRs strategic. Keep proof within reach.',
  description: 'See how RipoDoc helps MSPs pair a concise client report with controlled, reviewable evidence for selected claims—without replacing PSA, RMM, BI, or portal systems.',
  alternates: { canonical: '/for-msps' },
  openGraph: { url: '/for-msps', title: 'RipoDoc for MSPs | Controlled evidence delivery', description: 'A focused evidence-delivery layer for the report your MSP already sends.' },
  twitter: { card: 'summary_large_image', title: 'RipoDoc for MSPs | Controlled evidence delivery', description: 'Keep QBRs strategic. Keep proof within reach.' },
};

const faq = [
  { q: 'Does RipoDoc replace our PSA, RMM, BI tool, or client portal?', a: 'No. RipoDoc is designed as a controlled evidence-delivery layer for a selected report claim. It does not represent itself as a replacement for the systems that produce operational data.' },
  { q: 'What happens when a client asks to see the data behind a report claim?', a: 'The intended workflow is to open a bounded evidence view for the selected approved claim, rather than sending an unrestricted operational export. What is available depends on the configured workspace and the published evidence boundary.' },
  { q: 'Is the public demo real client data?', a: 'No. The public demonstration uses sample data. Do not submit customer data, credentials, PHI/ePHI, or other sensitive production information through the public demo.' },
  { q: 'Can RipoDoc be used as a compliance certification?', a: 'No. RipoDoc is not a blanket compliance certification. Customers remain responsible for their reporting content, source systems, approvals, access rules, and regulatory obligations.' },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

const steps = [
  ['Start with the report', 'Keep the executive narrative concise: one result, one recommendation, one decision.'],
  ['Select a claim', 'Choose the statement likely to trigger a reasonable “show me the source” question.'],
  ['Bound the support', 'Use only the supporting rows and provenance relevant to that statement—not a broad raw export.'],
  ['Review before publishing', 'Keep a human approval boundary before any evidence experience is delivered.'],
  ['Deliver with controls', 'Use the configured evidence-access boundary and retain the delivery outcome that the product records.'],
];

export default function ForMspsPage() {
  return (
    <div className="ledger-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <section className="ledger-hero border-b border-[#1d1a16]">
        <div className="ledger-wrap grid gap-10 py-14 lg:grid-cols-[1.15fr_.85fr] lg:py-20">
          <div>
            <p className="ledger-kicker"><span /> The RipoDoc method · MSP client reporting</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[.92] tracking-[-.055em] text-[#1d1a16] sm:text-6xl lg:text-7xl">Keep the QBR strategic.<br /><em className="font-serif text-[#2f5bea]">Keep proof within reach.</em></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#4b463e]">RipoDoc is a controlled evidence-delivery layer for the report your MSP already sends. Let the client conversation stay concise—then make an approved claim answerable when someone asks to inspect it.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/#sample-report" className="ledger-button">Open the sample report <ArrowRight className="size-4" /></Link>
              <Link href="/report-diagnostic-starter-kit" className="ledger-button-secondary">Use the report diagnostic kit</Link>
            </div>
            <p className="mt-4 max-w-xl text-xs leading-5 text-[#665f56]">The sample uses demonstration data. The hosted workspace remains intentionally fail-closed until its production services are configured.</p>
          </div>
          <aside className="border border-[#1d1a16] bg-[#1d1a16] p-5 text-[#f6f0e5] shadow-[10px_10px_0_#2f5bea]">
            <div className="flex items-center justify-between border-b border-[#f6f0e5]/25 pb-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#76e3cb]">Five-minute report teardown</span>
              <Presentation className="size-4 text-[#76e3cb]" />
            </div>
            <ol className="mt-3 divide-y divide-[#f6f0e5]/15">
              {['Open an executive-facing claim.', 'Ask what the client needs to verify.', 'Reveal bounded supporting evidence.', 'Show the human approval boundary.', 'Agree the next report action.'].map((item, index) => <li key={item} className="flex gap-3 py-3 text-sm leading-6"><span className="font-mono text-xs text-[#76e3cb]">0{index + 1}</span><span>{item}</span></li>)}
            </ol>
            <p className="mt-4 border-t border-[#f6f0e5]/25 pt-4 text-xs leading-5 text-[#cec8bc]">No generic AI trick. No raw spreadsheet dump. No promise that software replaces accountable review.</p>
          </aside>
        </div>
      </section>

      <section className="ledger-wrap py-16 lg:py-20">
        <div className="max-w-3xl">
          <p className="ledger-kicker"><span /> A narrow job worth testing</p>
          <h2 className="mt-4 font-serif text-4xl leading-none tracking-[-.045em] text-[#1d1a16] sm:text-5xl">The report is the conversation. Evidence is the answer.</h2>
          <p className="mt-5 text-lg leading-8 text-[#4b463e]">Most reporting products help gather, chart, automate, or portalize information. RipoDoc’s hypothesis is narrower: an MSP should be able to deliver the proof behind one selected claim to the right reader without making every operational row broadly available.</p>
        </div>
        <div className="mt-10 grid gap-px border border-[#1d1a16] bg-[#1d1a16] md:grid-cols-3">
          {[
            [FileSearch, 'A familiar client artifact', 'Keep the PDF or report narrative in front of the client.'],
            [ScanSearch, 'A bounded proof path', 'Expose relevant support for a selected, approved claim.'],
            [LockKeyhole, 'A deliberate delivery boundary', 'Use the configured access, expiry, and revocation controls rather than forwarding broad exports.'],
          ].map(([Icon, title, body]) => {
            const ItemIcon = Icon as typeof FileSearch;
            return <article key={title as string} className="bg-[#fffdf8] p-6"><ItemIcon className="size-5 text-[#2f5bea]" /><h3 className="mt-6 font-serif text-2xl tracking-[-.03em]">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#665f56]">{body as string}</p></article>;
          })}
        </div>
      </section>

      <section className="border-y border-[#1d1a16] bg-[#eee6d7]">
        <div className="ledger-wrap py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
            <div><p className="ledger-kicker"><span /> From claim to proof</p><h2 className="mt-4 font-serif text-4xl leading-none tracking-[-.045em] text-[#1d1a16]">The operating sequence</h2><p className="mt-5 text-base leading-7 text-[#4b463e]">Every step is intentionally explicit. RipoDoc does not turn unreviewed extraction or AI output into authority.</p></div>
            <ol className="border-t border-[#1d1a16]">
              {steps.map(([title, body], index) => <li key={title} className="grid gap-3 border-b border-[#1d1a16] py-4 sm:grid-cols-[3rem_1fr_1.3fr]"><span className="font-mono text-xs font-bold text-[#2f5bea]">0{index + 1}</span><strong className="text-sm uppercase tracking-[.1em]">{title}</strong><span className="text-sm leading-6 text-[#4b463e]">{body}</span></li>)}
            </ol>
          </div>
        </div>
      </section>

      <section className="ledger-wrap py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="border border-[#1d1a16] bg-[#fffdf8] p-7"><p className="ledger-kicker"><span /> Built for the report, not a rip-and-replace</p><h2 className="mt-4 font-serif text-3xl leading-none tracking-[-.04em]">What RipoDoc is designed to do</h2><ul className="mt-6 space-y-3 text-sm leading-6 text-[#4b463e]">{['Make approved report claims inspectable in context.', 'Keep a review-before-publish boundary.', 'Support controlled evidence delivery rather than unrestricted forwarding.', 'Work alongside the systems that already produce operational data.', 'Offer an operator-controlled self-hosted path.'].map(item => <li key={item} className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-[#2f5bea]" />{item}</li>)}</ul></div>
          <div className="border border-[#1d1a16] bg-[#1d1a16] p-7 text-[#f6f0e5]"><p className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#76e3cb]">Trust boundary</p><h2 className="mt-4 font-serif text-3xl leading-none tracking-[-.04em]">What it does not claim to do</h2><ul className="mt-6 space-y-3 text-sm leading-6 text-[#cec8bc]">{['Replace a PSA, RMM, BI tool, or general client portal.', 'Publish an AI-generated output without accountable review.', 'Turn arbitrary PDFs into perfect structured evidence.', 'Certify an MSP’s compliance, security, or healthcare posture.', 'Accept customer data through the public demonstration.'].map(item => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 bg-[#76e3cb]" />{item}</li>)}</ul></div>
        </div>
      </section>

      <section className="border-y border-[#1d1a16] bg-[#2f5bea] text-[#fffdf8]">
        <div className="ledger-wrap grid gap-9 py-14 lg:grid-cols-[1fr_.8fr] lg:items-end">
          <div><UsersRound className="size-6 text-[#76e3cb]" /><p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#cbd8ff]">Report diagnostic</p><h2 className="mt-4 max-w-3xl font-serif text-4xl leading-none tracking-[-.045em] sm:text-5xl">Bring one report question—not a vague transformation project.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-[#e6ecff]">The practical next step is a report teardown: identify one claim, its source, the intended reader, and the delivery boundary. It produces the evidence needed to decide whether this is a paid problem.</p></div>
          <div className="lg:justify-self-end"><Link href="/report-diagnostic-starter-kit" className="inline-flex items-center gap-2 border border-[#fffdf8] bg-[#fffdf8] px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#1d1a16] hover:bg-[#76e3cb]"><ShieldCheck className="size-4" /> Use the starter kit</Link><p className="mt-4 text-xs leading-5 text-[#cbd8ff]">The starter kit is not a place to submit credentials, customer exports, PHI/ePHI, or other sensitive production data.</p></div>
        </div>
      </section>

      <section className="ledger-wrap py-16 lg:py-20">
        <p className="ledger-kicker"><span /> Direct answers</p><h2 className="mt-4 font-serif text-4xl leading-none tracking-[-.045em] text-[#1d1a16]">Questions an MSP should ask before adding another tool.</h2>
        <div className="mt-8 divide-y border-y border-[#1d1a16]">
          {faq.map(({ q, a }, index) => <article key={q} className="grid gap-3 py-5 md:grid-cols-[3rem_1fr_1.25fr]"><span className="font-mono text-xs text-[#2f5bea]">0{index + 1}</span><h3 className="font-serif text-xl tracking-[-.025em]">{q}</h3><p className="text-sm leading-6 text-[#4b463e]">{a}</p></article>)}
        </div>
      </section>
    </div>
  );
}
