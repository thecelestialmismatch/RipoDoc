import Link from 'next/link';
import { ArrowUpRight, Code2, ShieldCheck } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';
import { CookieSettingsButton } from '@/components/CookieSettingsButton.tsx';

const productLinks = [
  { href: '/#sample-report', label: 'Interactive claim sample' },
  { href: '/how-it-works', label: 'Act I — the method' },
  { href: '/for-msps', label: 'Act II — MSP evidence fit' },
  { href: '/security', label: 'Act III — delivery controls' },
  { href: '/report-evidence-readiness', label: 'Evidence-readiness check' },
  { href: '/report-diagnostic-starter-kit', label: 'Report diagnostic starter kit' },
  { href: '/download', label: 'Self-host RipoDoc' },
] as const;
const trustLinks = [
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
  return <footer id="site-footer" className="bg-[#141111] text-[#f8f0df]">
    <div className="border-b border-[#f8f0df]/25 bg-[#e8442e]"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-9 sm:flex-row sm:items-end sm:justify-between lg:px-8"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb2a3]">Final curtain / the reporting moment</p><h2 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.08em] sm:text-5xl">From report to reality.</h2></div><Link href="/founding-partners" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#f8f0df] px-5 text-sm font-bold text-[#141111] transition hover:bg-[#141111] hover:text-[#f8f0df]">Open a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16"><div className="grid gap-12 border-b border-[#f8f0df]/20 pb-12 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.8fr]"><div><BrandLockup showDescriptor inverse /><p className="mt-6 max-w-md text-sm leading-7 text-[#f8f0df]/72">The proof is in the report. RipoDoc is the controlled evidence-delivery layer for a client-report moment—not a new client portal or a generic data export.</p><Link href="/download" className="mt-7 inline-flex items-center gap-2 border border-[#f8f0df] px-3.5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.11em] text-[#f8f0df] transition hover:bg-[#f8f0df] hover:text-[#141111]"><Code2 className="h-4 w-4" aria-hidden="true" /> Review the self-hosted build <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div><FooterColumn title="The program" links={productLinks} /><FooterColumn title="The boundary" links={trustLinks} /><FooterColumn title="Legal status" links={legalLinks} /></div><div className="flex flex-col gap-4 pt-7 text-xs text-[#f8f0df]/58 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} RipoDoc. Every reported number deserves an answer.</p><div className="flex flex-wrap items-center gap-x-4 gap-y-2"><CookieSettingsButton /><p className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[#ff9b88]" aria-hidden="true" /> Published status pages describe verified boundaries; they are not final contracts.</p></div></div></div>
  </footer>;
}

function FooterColumn({ title, links }: { readonly title: string; readonly links: readonly { readonly href: string; readonly label: string }[] }) {
  return <div><h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff9b88]">{title}</h2><ul className="mt-5 space-y-3 text-sm text-[#f8f0df]/72">{links.map((link) => <li key={link.href}><Link href={link.href} className="transition hover:text-[#ff9b88]">{link.label}</Link></li>)}</ul></div>;
}
