/**
 * RipoDoc marketing home — upgraded with modern design, animations, and features.
 */

import Image from 'next/image';
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
  Upload,
  BarChart3,
  Users,
  Eye,
  Clock,
  Send,
  TrendingUp,
} from 'lucide-react';
import { SampleReport } from '@/components/marketing/SampleReport.tsx';
import { loadManifest } from '@/lib/evidence/store.ts';

const SAMPLE_REPORT_ID = 'rpt-demo-0001';

const HERO_STATS: readonly { readonly value: string; readonly label: string; readonly icon: typeof Send }[] = [
  { value: '127', label: 'Tests passing', icon: CheckCircle2 },
  { value: '412', label: 'Sample data rows', icon: FileText },
  { value: '100%', label: 'PDF viewer support', icon: Eye },
  { value: '0', label: 'Data in the PDF', icon: LockKeyhole },
];

const HERO_BADGES: readonly { readonly icon: typeof ArrowRight; readonly label: string }[] = [
  { icon: FileCheck, label: 'Works in every PDF viewer' },
  { icon: LockKeyhole, label: 'Recipient-bound, not a public link' },
  { icon: ShieldCheck, label: 'Human-approved before publication' },
  { icon: Zap, label: 'Fast & lightweight' },
];

const FEATURES: readonly {
  readonly icon: typeof Upload;
  readonly title: string;
  readonly body: string;
  readonly gradient: string;
}[] = [
  {
    icon: Upload,
    title: 'Upload your own PDF',
    body: 'Drag and drop any PDF report. RipoDoc overlays interactive click zones on every figure \u2014 no reformatting required.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: BarChart3,
    title: 'Interactive evidence',
    body: 'Every number in your report becomes clickable. Clients see the exact rows behind each figure, scoped to them.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: LockKeyhole,
    title: 'Recipient-bound links',
    body: 'Evidence links are tied to one recipient\u2019s email hash. A forwarded link does not become a second reader.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Clock,
    title: 'Expiring & revocable',
    body: 'Set expiry on every link. Kill any single link by id without rotating keys or reissuing the report.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: ShieldCheck,
    title: 'Tamper-evident audit log',
    body: 'Every access \u2014 granted or denied \u2014 is recorded in a hash-chained append-only log. Modification is detectable.',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Human review gate',
    body: 'Each number is bound to the exact rows behind it and signed off by a person before publication. Nothing is hallucinated.',
    gradient: 'from-indigo-500 to-blue-500',
  },
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

const STEPS: readonly { readonly step: string; readonly title: string; readonly body: string; readonly icon: typeof Upload }[] = [
  {
    step: '01',
    title: 'Upload your PDF',
    body: 'Drag and drop the PDF you already send. Or generate one from a manifest. Either way, every figure becomes clickable.',
    icon: Upload,
  },
  {
    step: '02',
    title: 'A human approves every figure',
    body: 'Each number is bound to the exact rows behind it and signed off by a person before publication. Nothing is computed at read time.',
    icon: FileCheck,
  },
  {
    step: '03',
    title: 'Send a normal PDF',
    body: 'It opens in Chrome, Preview, Acrobat or a phone like any other PDF \u2014 except every figure is clickable.',
    icon: Send,
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
    <div className="bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white" />
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-200/30 to-violet-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-16">
          <div className="text-center">
            <Image
              src="/ripodoc-logo.jpeg"
              alt="RipoDoc logo"
              width={96}
              height={96}
              className="mx-auto mb-6 rounded-2xl object-contain shadow-lg shadow-blue-600/20"
              priority
            />
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 pulse-glow" />
              Secure interactive client reports for MSPs
            </div>

            <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Send a PDF.{' '}
              <span className="gradient-text">Every number is clickable.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Your client asks where a number came from. Instead of digging through a spreadsheet,
              they click it &mdash; and the exact rows behind it open, scoped to them, expiring,
              revocable and logged. Now with PDF upload.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
              {HERO_BADGES.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
                >
                  <badge.icon aria-hidden="true" className="h-4 w-4 text-blue-600" />
                  {badge.label}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/upload"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-xl hover:shadow-blue-600/30"
              >
                <Upload className="h-5 w-5 transition group-hover:scale-110" />
                Upload your PDF
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 hover:shadow-md"
              >
                Try the live demo
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {HERO_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-center shadow-sm backdrop-blur transition hover:shadow-md"
                >
                  <Icon className="mx-auto h-6 w-6 text-blue-600" />
                  <div className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</div>
                  <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            From PDF upload to tamper-evident audit logs, RipoDoc covers the full trust chain.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Try the interaction &mdash; right now</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              This is the real thing, running on sample data &mdash; the same report the PDF generator
              builds from. Click any figure on the left and watch the exact rows open on the right.
            </p>
          </div>
          <div className="mt-10">
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

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Three steps. No stack replacement. No new tool for your client to learn.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-3xl font-bold text-blue-100">{step.step}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <ScrollText aria-hidden="true" className="h-5 w-5 text-blue-600" />
            Why it works in every viewer
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Each figure carries a standard PDF link annotation. That is the one interaction mechanism
            every viewer supports &mdash; Chrome, Safari, macOS Preview, Acrobat, iOS and Android. The
            obvious alternative, embedded PDF JavaScript, is Acrobat-only: in a browser or on a phone
            it does nothing, silently. RipoDoc does not use it.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            The rows themselves never travel inside the PDF, so forwarding the file does not forward
            the data.
          </p>
        </div>
      </section>

      {/* Two Ways In */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Two ways in</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Keep your existing tools, or let RipoDoc generate the report. Either way, every figure
              is clickable.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-blue-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <FileText aria-hidden="true" className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold">Overlay</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Takes <strong>the PDF you already send</strong> and appends a click zone to every
                figure. Your original file is a byte-for-byte prefix of the output &mdash; nothing
                moves.
              </p>
              <div className="mt-4 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                  <Terminal aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Make an existing PDF clickable</span>
                </div>
                <pre className="mt-2 overflow-x-auto">
                  <code>{`npm run overlay:propose   # detect zones
npm run overlay:sample    # publish clickable PDF`}</code>
                </pre>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <FileCheck aria-hidden="true" className="h-5 w-5 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold">Generate</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Renders a report from a manifest. KPIs, bar charts, and supported claims &mdash; each
                with a link annotation to its evidence page.
              </p>
              <div className="mt-4 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                  <Terminal aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Generate a clickable report</span>
                </div>
                <pre className="mt-2 overflow-x-auto">
                  <code>{`npm run build:pdf          # https origin
npm run build:pdf:local   # localhost`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Not a public link</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Most &ldquo;shareable report&rdquo; links authorise anyone who holds the URL, forever.
            These do not.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {CONTROLS.map((control) => (
            <div
              key={control.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <dt className="font-semibold">{control.title}</dt>
                  <dd className="mt-1.5 text-sm leading-6 text-slate-600">{control.body}</dd>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-emerald-600" />
            The audit chain
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Every access &mdash; granted or denied &mdash; is recorded before rendering, in a
            hash-chained append-only log. Each record commits to the one before it. Deleting a record,
            reordering two, or changing a single timestamp breaks the chain at that point and every
            point after it. Modification is not impossible, it is <strong>detectable</strong> &mdash;
            which is the honest claim and the one an auditor cares about.
          </p>
          <div className="mt-4 rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Verify the audit log</span>
            </div>
            <pre className="mt-2">
              <code>{`npm run audit:verify   # asserts hash chain integrity`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">What sets RipoDoc apart</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Click-to-evidence is commodity inside BI tools. Nobody delivers it from the PDF an MSP
              actually emails a client.
            </p>
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
          <p className="mt-6 text-center text-sm text-slate-500">
            RipoDoc's uniqueness is not any single column &mdash; it is the{' '}
            <strong>combination</strong>. Three columns nobody occupies:{' '}
            <em>human review gate</em>, <em>recipient-bound + revocable</em>,{' '}
            <em>immutable audit trail</em>.
          </p>
        </div>
      </section>

      {/* Download / Get Started */}
      <section id="download" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Get started in 60 seconds</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Clone the repo, set a secret, and generate your first clickable PDF. No signup, no API
            key, no credit card.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Terminal aria-hidden="true" className="h-5 w-5 text-blue-600" />
              Quick start
            </h3>
            <div className="mt-4 rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
              <pre className="overflow-x-auto">
                <code>{`# 1. Clone
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
open build/demo-report.local.pdf`}</code>
              </pre>
            </div>
            <p className="mt-3 text-xs text-slate-500">Requires Node 22.6+ (native TypeScript execution).</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-emerald-600" />
              What you get
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>A clickable PDF that opens in every viewer &mdash; Chrome, Safari, Preview, Acrobat, mobile</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>Recipient-bound, expiring, revocable evidence links &mdash; not a public URL</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>A hash-chained audit log that detects any tampering</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>An overlay engine that makes your existing PDF clickable &mdash; byte-for-byte preserved</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>Upload your own PDFs directly from the web UI</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>A dashboard with analytics and access logs</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/thecelestialmismatch/RipoDoc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
          >
            View on GitHub
          </a>
          <a
            href="https://github.com/thecelestialmismatch/RipoDoc/fork"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            Fork the repo
          </a>
        </div>
      </section>
    </div>
  );
}