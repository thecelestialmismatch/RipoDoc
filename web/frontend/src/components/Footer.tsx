import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Code2, ShieldCheck } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';
import { CookieSettingsButton } from '@/components/CookieSettingsButton.tsx';

const productLinks = [
  { href: '/#sample-report', label: 'Interactive sample' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/for-msps', label: 'For MSPs' },
  { href: '/report-evidence-readiness', label: 'Evidence-readiness check' },
  { href: '/report-diagnostic-starter-kit', label: 'Report diagnostic starter kit' },
  { href: '/download', label: 'Self-host RipoDoc' },
] as const;
const trustLinks = [
  { href: '/security', label: 'Security boundary' },
  { href: '/guides/msp-client-reporting-qbr-metric-evidence', label: 'QBR metric evidence guide' },
  { href: '/founding-partners', label: 'Open a report diagnostic' },
  { href: '/legal', label: 'Legal status hub' },
  { href: '/legal/healthcare-mode-b', label: 'Healthcare Mode B' },
] as const;
const legalLinks = [
  { href: '/legal/privacy', label: 'Privacy information' },
  { href: '/legal/cookies', label: 'Cookie information' },
  { href: '/legal/terms', label: 'Terms status' },
  { href: '/legal/refunds', label: 'Refunds status' },
  { href: '/legal/sla', label: 'SLA status' },
  { href: '/legal/dpa', label: 'DPA status' },
] as const;

export function Footer() {
  return <footer id="site-footer" className="bg-[#0f1b2d] text-white">
    <div className="border-b border-white/15 bg-[#e8f1ff] text-[#0f1b2d]"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#245cff]">One report moment at a time</p><h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.06em] sm:text-4xl">Give every important figure a clear answer.</h2></div><Link href="/founding-partners" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#245cff] px-4 text-sm font-bold text-white transition hover:bg-[#143ea6]">Open a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8"><div className="grid gap-10 border-b border-white/15 pb-12 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.75fr]"><div><BrandLockup showDescriptor inverse /><p className="mt-6 max-w-md text-sm leading-7 text-white/70">RipoDoc is the controlled evidence-delivery layer for an approved claim in a client report. It does not replace the systems that create your operational data.</p><Link href="/download" className="mt-7 inline-flex items-center gap-2 rounded-lg border border-white/30 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#0f1b2d]"><Code2 className="h-4 w-4" aria-hidden="true" /> Explore self-hosting <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div><FooterColumn title="Product" links={productLinks} /><FooterColumn title="Trust" links={trustLinks} /><FooterColumn title="Legal" links={legalLinks} /></div><div className="flex flex-col gap-4 pt-7 text-xs text-white/58 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} RipoDoc. Every reported number deserves an answer.</p><div className="flex flex-wrap items-center gap-x-4 gap-y-2"><CookieSettingsButton /><p className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[#8ee5bb]" aria-hidden="true" /> Published status pages describe verified boundaries; they are not final contracts.</p></div></div></div>
  </footer>;
}

function FooterColumn({ title, links }: { readonly title: string; readonly links: readonly { readonly href: string; readonly label: string }[] }) {
  return <div><h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#8ee5bb]">{title}</h2><ul className="mt-5 space-y-3 text-sm text-white/70">{links.map((link) => <li key={link.href}><Link href={link.href} className="transition hover:text-white">{link.label}</Link></li>)}</ul></div>;
}
