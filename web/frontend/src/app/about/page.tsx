import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpenCheck, Code2, FileCheck2, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About RipoDoc',
  description: 'RipoDoc is controlled evidence delivery for MSP client reports: a narrow proof path from an approved claim to recipient-aware, time-limited supporting evidence.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About RipoDoc — controlled evidence delivery for MSP client reports',
    description: 'The product category, operating boundary, and open-source path behind RipoDoc.',
    url: '/about',
  },
};

const principles = [
  {
    icon: FileCheck2,
    title: 'The report stays familiar',
    body: 'RipoDoc begins with the client report an MSP already uses. It does not require every report reader to adopt a broad operational portal just to inspect one result.',
  },
  {
    icon: ShieldCheck,
    title: 'The evidence stays bounded',
    body: 'A selected claim can be connected to reviewed supporting rows, source context, an intended reader, and a controlled access condition instead of an unrestricted export.',
  },
  {
    icon: BookOpenCheck,
    title: 'A person still approves',
    body: 'The product does not make arbitrary PDF charts defensible or turn unreviewed AI output into authority. Source, scope, and publication remain deliberate decisions.',
  },
] as const;

const aboutStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://www.ripodoc.com/about#webpage',
  url: 'https://www.ripodoc.com/about',
  name: 'About RipoDoc',
  description: 'RipoDoc is controlled evidence delivery for MSP client reports.',
  isPartOf: { '@id': 'https://www.ripodoc.com/#website' },
  about: { '@id': 'https://www.ripodoc.com/#organization' },
  mainEntity: { '@id': 'https://www.ripodoc.com/#software' },
  inLanguage: 'en-US',
};

export default function AboutPage() {
  return (
    <main className="bg-[#fffdf8] text-[#1d1a16]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutStructuredData).replace(/</g, '\\u003c') }} />
      <section className="border-b border-[#1d1a16] bg-[radial-gradient(circle_at_82%_5%,rgba(239,214,107,0.58),transparent_25%),radial-gradient(circle_at_10%_88%,rgba(61,85,179,0.14),transparent_26%),#f6f0e5]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:py-24">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#3d55b3]">About the product</p>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl font-bold leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            RipoDoc is controlled evidence delivery for MSP client reports.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#4b463e] sm:text-xl">
            RipoDoc helps a Managed Service Provider keep the client report concise while giving one approved claim a narrow, reviewable proof path. The report stays client-first; the support stays scoped to the question.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/how-it-works" className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#1d1a16] bg-[#1d1a16] px-5 py-3 text-sm font-bold text-[#fffdf8] shadow-[4px_4px_0_#d9503b] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">
              Read the method <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href="/founding-partners" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#1d1a16] bg-[#fffdf8] px-5 py-3 text-sm font-bold text-[#1d1a16] transition hover:bg-[#efd66b]">
              <Code2 className="size-4" aria-hidden="true" /> Inspect the open-source build
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#d9503b]">The category</p>
            <h2 className="mt-4 font-serif text-4xl font-bold leading-none tracking-[-0.045em]">A layer for the moment a client asks, “Where did that number come from?”</h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-[#4b463e]">
            <p>
              RipoDoc is not a PSA, RMM, BI platform, general-purpose client portal, or a promise that a visual PDF chart can be perfectly reconstructed as data. It works beside the systems that produce operational reporting.
            </p>
            <p>
              A defensible proof path starts with a reviewed structured source or mapping. Before publication, an accountable person should be able to name the claim, source, evidence scope, intended reader, and review decision behind the result.
            </p>
            <p>
              The exact product name is <strong className="text-[#1d1a16]">RipoDoc</strong>, written as one word. Its product category is <strong className="text-[#1d1a16]">controlled evidence delivery for MSP client reports</strong>.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#1d1a16] bg-[#1d1a16] text-[#fffdf8]">
        <div className="mx-auto grid max-w-7xl gap-px bg-white/15 px-5 py-px sm:px-6 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, body }) => (
            <article key={title} className="bg-[#1d1a16] px-6 py-9 sm:px-8">
              <Icon className="size-6 text-[#efd66b]" aria-hidden="true" />
              <h2 className="mt-6 text-xl font-bold tracking-[-0.025em]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 border border-[#1d1a16] bg-[#f6f0e5] p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#3d55b3]">Public boundary</p>
            <h2 className="mt-4 font-serif text-4xl font-bold leading-none tracking-[-0.045em]">Inspect the idea without sending client data.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#4b463e]">
              The public sample uses fixture data. The hosted workspace intentionally remains fail-closed until durable identity, email, CAPTCHA, audit storage, and private-worker configuration satisfy the production release gate. Self-hosted operators can inspect the full application and its operating materials in the repository.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href="/for-msps" className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#1d1a16] bg-[#fffdf8] px-5 py-3 text-sm font-bold transition hover:bg-[#efd66b]">Explore the MSP fit <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <Link href="/download" className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#1d1a16] bg-[#d9503b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b53c2c]">Self-host RipoDoc <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
