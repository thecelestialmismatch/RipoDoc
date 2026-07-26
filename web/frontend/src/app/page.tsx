/**
 * RipoDoc marketing home.
 *
 * Deliberately free of environment dependencies: the sample report renders from
 * the same manifest the PDF generator consumes, so the site works on a fresh
 * deploy before any secret is configured. Real evidence pages stay token-gated.
 */

import Link from 'next/link';
import { FileCheck, Link2, LockKeyhole, ScrollText } from 'lucide-react';
import { SampleReport } from '@/components/marketing/SampleReport.tsx';
import { loadManifest } from '@/lib/evidence/store.ts';

const SAMPLE_REPORT_ID = 'rpt-demo-0001';

const CONTROLS: readonly { readonly title: string; readonly body: string }[] = [
  {
    title: 'Bound to one recipient',
    body: 'The reader’s email is hashed into a signed token, never embedded. A forwarded link does not become a second reader.',
  },
  {
    title: 'Expiring and revocable',
    body: 'Expiry is signed into the link. Any single link can be killed by id, without rotating keys or reissuing the report.',
  },
  {
    title: 'Scoped to one figure',
    body: 'A click opens the rows behind that figure — not the rest of the report, and not other clients’ data.',
  },
  {
    title: 'Logged, every time',
    body: 'Granted and denied access are both recorded before anything renders. “Who opened it, and when” is answerable.',
  },
];

const STEPS: readonly { readonly step: string; readonly title: string; readonly body: string }[] = [
  {
    step: '01',
    title: 'You supply the data',
    body: 'CSV, an API pull, or an export from the PSA, RMM or CRM you already use. RipoDoc replaces nothing in your stack.',
  },
  {
    step: '02',
    title: 'A human approves every figure',
    body: 'Each number is bound to the exact rows behind it and signed off by a person before publication. Nothing is computed at read time, so nothing can be hallucinated.',
  },
  {
    step: '03',
    title: 'Send a normal PDF',
    body: 'It opens in Chrome, Preview, Acrobat or a phone like any other PDF — except every figure is clickable.',
  },
];

export default async function Home() {
  const manifest = await loadManifest(SAMPLE_REPORT_ID);

  return (
    <div className="flex-1 bg-white text-slate-900 [color-scheme:light]">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">RipoDoc</span>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            How it works
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Client reporting for managed service providers
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Send a PDF. Every number is clickable.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Your client asks where a number came from. Instead of digging through a spreadsheet,
            they click it — and the exact rows behind it open, scoped to them, expiring, revocable
            and logged.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
              <Link2 aria-hidden="true" className="h-4 w-4 text-blue-600" />
              Works in every PDF viewer
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
              <LockKeyhole aria-hidden="true" className="h-4 w-4 text-blue-600" />
              Recipient-bound, not a public link
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
              <FileCheck aria-hidden="true" className="h-4 w-4 text-blue-600" />
              Human-approved before publication
            </span>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-12">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold tracking-tight">Try the interaction</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              This is the real thing, running on sample data — the same report the PDF generator
              builds from.
            </p>
            <div className="mt-8">
              {manifest ? (
                <SampleReport manifest={manifest} />
              ) : (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  The sample report could not be loaded.
                </p>
              )}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.step}>
                <span className="text-xs font-bold tracking-widest text-blue-600">{step.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <ScrollText aria-hidden="true" className="h-5 w-5 text-blue-600" />
              Why it works in every viewer
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Each figure carries a standard PDF link annotation. That is the one interaction
              mechanism every viewer supports — Chrome, Safari, macOS Preview, Acrobat, iOS and
              Android. The obvious alternative, embedded PDF JavaScript, is Acrobat-only: in a
              browser or on a phone it does nothing, silently. RipoDoc does not use it.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              The rows themselves never travel inside the PDF, so forwarding the file does not
              forward the data.
            </p>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold tracking-tight">Not a public link</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Most “shareable report” links authorise anyone who holds the URL, forever. These do
              not.
            </p>
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              {CONTROLS.map((control) => (
                <div key={control.title} className="rounded-lg border border-slate-200 bg-white p-5">
                  <dt className="font-semibold text-slate-900">{control.title}</dt>
                  <dd className="mt-1.5 text-sm leading-6 text-slate-600">{control.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto max-w-6xl px-6 text-sm text-slate-500">
          <p>
            RipoDoc — pre-revenue and in validation. The interaction above is implemented and
            verified end to end; the authoring UI and PSA connectors are not built yet.
          </p>
        </div>
      </footer>
    </div>
  );
}
