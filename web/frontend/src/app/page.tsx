/**
 * RipoDoc marketing home — the best possible showcase of what the product does.
 *
 * Deliberately free of environment dependencies: the sample report renders from
 * the same manifest the PDF generator consumes, so the site works on a fresh
 * deploy before any secret is configured. Real evidence pages stay token-gated.
 */

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  LockKeyhole,
  ScrollText,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import { SampleReport } from '@/components/marketing/SampleReport.tsx';
import { loadManifest } from '@/lib/evidence/store.ts';

const SAMPLE_REPORT_ID = 'rpt-demo-0001';

const HERO_BADGES: readonly { readonly icon: typeof ArrowRight; readonly label: string }[] = [
  { icon: FileCheck, label: 'Works in every PDF viewer' },
  { icon: LockKeyhole, label: 'Recipient-bound, not a public link' },
  { icon: ShieldCheck, label: 'Human-approved before publication' },
  { icon: Zap, label: '127 tests passing' },
];

const CONTROLS: readonly { readonly title: string; readonly body: string }[] = [
  {
    title: 'Bound to one recipient',
    body: 'The reader\u2019s email is hashed into a signed token, never embedded. A forwarded link does not become a second reader.',
  },
  {
    title: 'Expiring and revocable',
    body: 'Expiry is signed into the link. Any single link can be killed by id, without rotating keys or reissuing the report.',
  },
  {
    title: 'Scoped to one figure',
    body: 'A click opens the rows behind that figure \u2014 not the rest of the report, and not other clients\u2019 data.',
  },
  {
    title: 'Logged, every time',
    body: 'Granted and denied access are both recorded before anything renders. \u201CWho opened it, and when\u201D is answerable.',
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
    body: 'It opens in Chrome, Preview, Acrobat or a phone like any other PDF \u2014 except every figure is clickable.',
  },
];

const COMPETITORS: readonly {
  readonly name: string;
  readonly document: boolean | string;
  readonly rows: boolean | string;
  readonly review: boolean;
  readonly bound: boolean | string;
  readonly audit: boolean;
}[] = [
  { name: 'MSPBots', document: false, rows: true, review: false, bound: false, audit: false },
  { name: 'BrightGauge', document: false, rows: '~', review: false, bound: '~', audit: false },
  { name: 'Cognition360', document: false, rows: 'via Power BI', review: false, bound: '~', audit: false },
  { name: 'Lifecycle Insights', document: true, rows: false, review: false, bound: '~', audit: false },
  { name: 'Handover', document: true, rows: false, review: false, bound: false, audit: false },
  { name: 'Power BI', document: false, rows: true, review: false, bound: '~', audit: false },
  { name: 'Foleon', document: true, rows: false, review: false, bound: '~', audit: false },
];

const renderCell = (value: boolean | string) => {
  if (value === true) return <span className="text-emerald-600 font-bold">&#10003;</span>;
  if (value === false) return <span className="text-slate-300">&#10007;</span>;
  return <span className="text-amber-500 text-xs">{value}</span>;
};

export default async function Home() {
  const manifest = await loadManifest(SAMPLE_REPORT_ID);

  return (
    <div className="flex-1 bg-white text-slate-900 [color-scheme:light]">
      {/* Header */}
      <header className="border-b border-slate-200 sticky top-0 z-20 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText aria-hidden="true" className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold tracking-tight">RipoDoc</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="#demo" className="font-medium text-slate-600 hover:text-blue-700 transition">Demo</Link>
            <Link href="#how-it-works" className="font-medium text-slate-600 hover:text-blue-700 transition">How it works</Link>
            <Link href="#security" className="font-medium text-slate-600 hover:text-blue-700 transition">Security</Link>
            <Link href="#download" className="font-medium text-slate-600 hover:text-blue-700 transition">Download</Link>
            <a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700 transition">
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white" />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-12">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Secure interactive client reports for MSPs</p>
            <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Send a PDF.{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Every number is clickable.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Your client asks where a number came from. Instead of digging through a spreadsheet, they click it \u2014 and the exact rows behind it open, scoped to them, expiring, revocable and logged.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
              {HERO_BADGES.map((badge) => (
                <span key={badge.label} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <badge.icon aria-hidden="true" className="h-4 w-4 text-blue-600" />
                  {badge.label}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="#demo" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition">
                Try the live demo
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link href="#download" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition">
                <Download aria-hidden="true" className="h-4 w-4" />
                Get started
              </Link>
            </div>
          </div>
        </div>

        {/* ASCII Art Diagram */}
        <div className="relative mx-auto max-w-4xl px-6 pb-8">
          <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-6 text-xs leading-relaxed text-slate-700 shadow-sm">{`┌─ The PDF (opens anywhere) ─────────┐        ┌─ The evidence page ──────────────┐
│                                    │        │  The 14 assets flagged at risk   │
│   412        97.4%       14        │        │  ────────────────────────────    │
│   Tickets    SLA         At risk ──┼──────► │  How this figure was calculated  │
│                          [VIEW DATA]        │  RMM — warranty_end < today …    │
│                                    │        │  ┌──────────────────────────┐    │
│   ▇▇  ▇▇▇  ▇▇▇  Ticket volume      │        │  │ HV-WKS-014  Workstation …│    │
│                                    │        │  │ HV-WKS-021  Workstation …│    │
└────────────────────────────────────┘        │  └──────────────────────────┘    │
                                               │  Approved by Priya Raman · logged│
                                               └──────────────────────────────────┘`}</pre>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Try the interaction \u2014 right now</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">This is the real thing, running on sample data \u2014 the same report the PDF generator builds from. Click any figure on the left and watch the exact rows open on the right.</p>
          </div>
          <div className="mt-10">
            {manifest ? <SampleReport manifest={manifest} /> : <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">The sample report could not be loaded.</p>}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">Three steps. No stack replacement. No new tool for your client to learn.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.step} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <span className="text-3xl font-bold text-blue-100">{step.step}</span>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><ScrollText aria-hidden="true" className="h-5 w-5 text-blue-600" />Why it works in every viewer</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Each figure carries a standard PDF link annotation. That is the one interaction mechanism every viewer supports \u2014 Chrome, Safari, macOS Preview, Acrobat, iOS and Android. The obvious alternative, embedded PDF JavaScript, is Acrobat-only: in a browser or on a phone it does nothing, silently. RipoDoc does not use it.</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">The rows themselves never travel inside the PDF, so forwarding the file does not forward the data.</p>
        </div>
      </section>

      {/* Two Ways In */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Two ways in</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">Keep your existing tools, or let RipoDoc generate the report. Either way, every figure is clickable.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border-2 border-blue-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"><FileText aria-hidden="true" className="h-5 w-5 text-blue-600" /></div>
                <h3 className="text-lg font-bold">Overlay</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">Takes <strong>the PDF you already send</strong> and appends a click zone to every figure. Your original file is a byte-for-byte prefix of the output \u2014 nothing moves.</p>
              <div className="mt-4 rounded-md bg-slate-900 p-4 text-xs text-slate-100">
                <div className="flex items-center gap-2 text-slate-400"><Terminal aria-hidden="true" className="h-3.5 w-3.5" /><span>Make an existing PDF clickable</span></div>
                <pre className="mt-2 overflow-x-auto"><code>{`npm run overlay:propose   # detect zones
npm run overlay:sample    # publish clickable PDF`}</code></pre>
              </div>
            </div>
            <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100"><FileCheck aria-hidden="true" className="h-5 w-5 text-slate-600" /></div>
                <h3 className="text-lg font-bold">Generate</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">Renders a report from a manifest. KPIs, bar charts, and supported claims \u2014 each with a link annotation to its evidence page.</p>
              <div className="mt-4 rounded-md bg-slate-900 p-4 text-xs text-slate-100">
                <div className="flex items-center gap-2 text-slate-400"><Terminal aria-hidden="true" className="h-3.5 w-3.5" /><span>Generate a clickable report</span></div>
                <pre className="mt-2 overflow-x-auto"><code>{`npm run build:pdf          # https origin
npm run build:pdf:local   # localhost`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Not a public link</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">Most \u201Cshareable report\u201D links authorise anyone who holds the URL, forever. These do not.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {CONTROLS.map((control) => (
            <div key={control.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start gap-3">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <dt className="font-semibold text-slate-900">{control.title}</dt>
                  <dd className="mt-1.5 text-sm leading-6 text-slate-600">{control.body}</dd>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck aria-hidden="true" className="h-5 w-5 text-emerald-600" />The audit chain</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Every access \u2014 granted or denied \u2014 is recorded before rendering, in a hash-chained append-only log. Each record commits to the one before it. Deleting a record, reordering two, or changing a single timestamp breaks the chain at that point and every point after it. Modification is not impossible, it is <strong>detectable</strong> \u2014 which is the honest claim and the one an auditor cares about.</p>
          <div className="mt-4 rounded-md bg-slate-900 p-4 text-xs text-slate-100">
            <div className="flex items-center gap-2 text-slate-400"><Terminal aria-hidden="true" className="h-3.5 w-3.5" /><span>Verify the audit log</span></div>
            <pre className="mt-2"><code>{`npm run audit:verify   # asserts hash chain integrity`}</code></pre>
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">What sets RipoDoc apart</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">Click-to-evidence is commodity inside BI tools. Nobody delivers it from the PDF an MSP actually emails a client.</p>
          </div>
          <div className="mt-10 overflow-x-auto">
            <table className="mx-auto w-full max-w-4xl border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900"></th>
                  <th className="px-3 py-3 text-center font-semibold text-slate-700">Document-shaped</th>
                  <th className="px-3 py-3 text-center font-semibold text-slate-700">Reader sees rows</th>
                  <th className="px-3 py-3 text-center font-semibold text-slate-700">Review gate</th>
                  <th className="px-3 py-3 text-center font-semibold text-slate-700">Recipient-bound</th>
                  <th className="px-3 py-3 text-center font-semibold text-slate-700">Audit trail</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((row) => (
                  <tr key={row.name} className="border-b border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                    <td className="px-3 py-3 text-center">{renderCell(row.document)}</td>
                    <td className="px-3 py-3 text-center">{renderCell(row.rows)}</td>
                    <td className="px-3 py-3 text-center">{renderCell(row.review)}</td>
                    <td className="px-3 py-3 text-center">{renderCell(row.bound)}</td>
                    <td className="px-3 py-3 text-center">{renderCell(row.audit)}</td>
                  </tr>
                ))}
                <tr className="border-b-2 border-blue-300 bg-blue-50">
                  <td className="px-4 py-3 font-bold text-blue-900">RipoDoc</td>
                  <td className="px-3 py-3 text-center"><span className="text-emerald-600 font-bold">&#10003;</span></td>
                  <td className="px-3 py-3 text-center"><span className="text-emerald-600 font-bold">&#10003;</span></td>
                  <td className="px-3 py-3 text-center"><span className="text-emerald-600 font-bold">&#10003;</span></td>
                  <td className="px-3 py-3 text-center"><span className="text-emerald-600 font-bold">&#10003;</span></td>
                  <td className="px-3 py-3 text-center"><span className="text-emerald-600 font-bold">&#10003;</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">RipoDoc&apos;s uniqueness is not any single column \u2014 it is the <strong>combination</strong>. Three columns nobody occupies: <em>human review gate</em>, <em>recipient-bound + revocable</em>, <em>immutable audit trail</em>.</p>
        </div>
      </section>

      {/* Download / Get Started */}
      <section id="download" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Get started in 60 seconds</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">Clone the repo, set a secret, and generate your first clickable PDF. No signup, no API key, no credit card.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold"><Terminal aria-hidden="true" className="h-5 w-5 text-blue-600" />Quick start</h3>
            <div className="mt-4 rounded-md bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
              <pre className="overflow-x-auto"><code>{`# 1. Clone
git clone https://github.com/thecelestialmismatch/RipoDoc.git
cd RipoDoc

# 2. Install
npm install --prefix web/frontend

# 3. Set the signing secret (32+ chars)
export RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)"

# 4. Verify everything works
npm run verify

# 5. Generate a clickable PDF
npm run build:pdf:local

# 6. Open it and click any figure
open build/demo-report.local.pdf`}</code></pre>
            </div>
            <p className="mt-3 text-xs text-slate-500">Requires Node 22.6+ (native TypeScript execution).</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold"><CheckCircle2 aria-hidden="true" className="h-5 w-5 text-emerald-600" />What you get</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>A clickable PDF that opens in every viewer \u2014 Chrome, Safari, Preview, Acrobat, mobile</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>Recipient-bound, expiring, revocable evidence links \u2014 not a public URL</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>A hash-chained audit log that detects any tampering</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>An overlay engine that makes your existing PDF clickable \u2014 byte-for-byte preserved</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>127 tests covering every trust boundary</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>A demo manifest with 412 real ticket rows</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-700 transition">
            View on GitHub
          </a>
          <a href="https://github.com/thecelestialmismatch/RipoDoc/fork" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition">
            <ExternalLink aria-hidden="true" className="h-4 w-4" />Fork the repo
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <FileText aria-hidden="true" className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-bold">RipoDoc</span>
              </div>
              <p className="mt-3 max-w-sm text-sm text-slate-600">The secure reporting delivery and evidence layer for MSPs. Send a normal PDF where every figure is clickable, recipient-bound and audited.</p>
              <p className="mt-4 text-xs text-slate-400">Pre-revenue, validation phase. The interaction and overlay are implemented and verified end to end. The authoring UI and PSA connectors are not built yet.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link href="#demo" className="hover:text-blue-700 transition">Live demo</Link></li>
                <li><Link href="#how-it-works" className="hover:text-blue-700 transition">How it works</Link></li>
                <li><Link href="#security" className="hover:text-blue-700 transition">Security model</Link></li>
                <li><Link href="#download" className="hover:text-blue-700 transition">Get started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Resources</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition">GitHub repository</a></li>
                <li><a href="https://github.com/thecelestialmismatch/RipoDoc/blob/main/docs/00-strategy/master-plan.md" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition">Master plan</a></li>
                <li><a href="https://github.com/thecelestialmismatch/RipoDoc/blob/main/docs/02-product/prd.md" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition">Product requirements</a></li>
                <li><a href="https://github.com/thecelestialmismatch/RipoDoc/blob/main/docs/02-product/interaction-spec.md" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition">Interaction spec</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            <p>RipoDoc \u2014 Built for MSPs who send client reports and get asked <em>&ldquo;where did that number come from?&rdquo;</em></p>
          </div>
        </div>
      </footer>
    </div>
  );
}