import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { legalStatusNotice } from '@/lib/launch/legal.ts';

export function LegalPageShell(input: {
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <Link href="/legal" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Legal information hub
          </Link>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{input.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">{input.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">{input.summary}</p>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
        <div className="mb-8 flex max-w-4xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <p><strong>Current status:</strong> {legalStatusNotice}</p>
        </div>
        <div className="max-w-4xl">{input.children}</div>
      </main>
    </div>
  );
}

export function LegalSection(input: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section className="border-t border-slate-200 py-8 first:border-t-0 first:pt-0">
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">{input.title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700 sm:text-base">{input.children}</div>
    </section>
  );
}

export function DecisionList(input: { readonly items: readonly string[] }) {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {input.items.map((item) => (
        <li key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">{item}</li>
      ))}
    </ul>
  );
}
