import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { legalStatusNotice } from '@/lib/launch/legal.ts';

export function LegalPageShell(input: { readonly eyebrow: string; readonly title: string; readonly summary: string; readonly children: ReactNode }) {
  return <div className="stage-page bg-[#f8f0df] text-[#141111]">
    <section className="relative overflow-hidden border-b border-[#141111] bg-[#e8442e] text-[#f8f0df]"><div className="pointer-events-none absolute right-0 top-0 text-[13rem] font-black leading-none tracking-[-0.15em] text-transparent [-webkit-text-stroke:1px_rgba(248,240,223,0.48)]" aria-hidden="true">STATUS</div><div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-18 lg:px-8"><Link href="/legal" className="inline-flex items-center gap-2 text-sm font-bold text-[#f8f0df]/85 transition hover:text-[#141111]"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Legal information hub</Link><p className="stage-kicker mt-10 text-[#ffb2a3]">{input.eyebrow}</p><h1 className="stage-display mt-5 max-w-4xl text-5xl sm:text-6xl">{input.title}</h1><p className="mt-6 max-w-3xl text-base leading-7 text-[#f8f0df]/88 sm:text-lg">{input.summary}</p></div></section>
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8"><div className="mb-10 flex max-w-4xl items-start gap-3 border-l-4 border-[#e8442e] bg-[#f0dfcc] px-5 py-4 text-sm leading-6 text-[#141111]"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#b52e20]" aria-hidden="true" /><p><strong>Current status:</strong> {legalStatusNotice}</p></div><div className="max-w-4xl">{input.children}</div></main>
  </div>;
}

export function LegalSection(input: { readonly title: string; readonly children: ReactNode }) { return <section className="border-t border-[#141111]/25 py-9 first:border-t-0 first:pt-0"><h2 className="text-3xl font-extrabold tracking-[-0.06em] text-[#141111]">{input.title}</h2><div className="mt-5 space-y-4 text-sm leading-7 text-[#655c55] sm:text-base">{input.children}</div></section>; }
export function DecisionList(input: { readonly items: readonly string[] }) { return <ul className="mt-6 grid gap-px border border-[#141111] bg-[#141111] sm:grid-cols-2">{input.items.map((item, index) => <li key={item} className="flex gap-3 bg-[#fff9ef] px-4 py-4 text-sm leading-6 text-[#655c55]"><span className="font-mono text-xs font-bold text-[#b52e20]">{String(index + 1).padStart(2, '0')}</span><span>{item}</span></li>)}</ul>; }
