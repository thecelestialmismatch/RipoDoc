import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { legalStatusNotice } from '@/lib/launch/legal.ts';

export function LegalPageShell(input: { readonly eyebrow: string; readonly title: string; readonly summary: string; readonly children: ReactNode }) {
  return <div className="bg-[#f5f7fb] text-[#0b1226]">
    <section className="proof-canvas relative overflow-hidden text-white"><div className="pointer-events-none absolute right-[10%] top-0 h-full w-px bg-white/10" /><div className="relative mx-auto max-w-7xl px-6 py-14 sm:py-18"><Link href="/legal" className="inline-flex items-center gap-2 text-sm font-bold text-teal-200 transition hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Legal information hub</Link><p className="eyebrow-rule mt-10 text-xs font-bold uppercase tracking-[0.2em] text-teal-200">{input.eyebrow}</p><h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.06em] sm:text-6xl">{input.title}</h1><p className="mt-6 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">{input.summary}</p></div></section>
    <main className="mx-auto max-w-7xl px-6 py-12 sm:py-16"><div className="mb-10 flex max-w-4xl items-start gap-3 border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" /><p><strong>Current status:</strong> {legalStatusNotice}</p></div><div className="max-w-4xl">{input.children}</div></main>
  </div>;
}

export function LegalSection(input: { readonly title: string; readonly children: ReactNode }) { return <section className="border-t border-slate-300 py-9 first:border-t-0 first:pt-0"><h2 className="text-3xl font-bold tracking-[-0.045em] text-[#0b1226]">{input.title}</h2><div className="mt-5 space-y-4 text-sm leading-7 text-slate-700 sm:text-base">{input.children}</div></section>; }

export function DecisionList(input: { readonly items: readonly string[] }) { return <ul className="mt-6 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2">{input.items.map((item, index) => <li key={item} className="flex gap-3 bg-white px-4 py-4 text-sm leading-6 text-slate-700"><span className="font-mono text-xs font-bold text-[#2f62e8]">{String(index + 1).padStart(2, '0')}</span><span>{item}</span></li>)}</ul>; }
