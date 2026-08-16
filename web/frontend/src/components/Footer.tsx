import Link from 'next/link';
import { ArrowUpRight, Code2, ShieldCheck } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';
import { CookieSettingsButton } from '@/components/CookieSettingsButton.tsx';

const productLinks = [
  { href: '/#sample-report', label: 'Interactive claim sample' },
  { href: '/how-it-works', label: 'How the method works' },
  { href: '/about', label: 'About RipoDoc' },
  { href: '/for-msps', label: 'For MSPs: demo & fit' },
  { href: '/report-evidence-readiness', label: 'Evidence-readiness check' },
  { href: '/report-diagnostic-starter-kit', label: 'Report diagnostic starter kit' },
  { href: '/guides/msp-client-reporting-qbr-metric-evidence', label: 'QBR metric evidence guide' },
  { href: '/download', label: 'Download & self-host' },
] as const;

const trustLinks = [
  { href: '/security', label: 'Security controls' },
  { href: '/legal', label: 'Legal status' },
  { href: '/legal/healthcare-mode-b', label: 'Healthcare Mode B' },
  { href: '/founding-partners', label: 'Report diagnostic' },
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
  return <footer id="site-footer" className="border-t border-[#1d1a16] bg-[#1d1a16] text-[#fffdf8]">
    <div className="mx-auto max-w-7xl px-6 py-14 lg:py-16"><div className="grid gap-12 border-b border-white/20 pb-12 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.8fr]"><div><BrandLockup showDescriptor inverse /><p className="mt-6 max-w-md text-sm leading-7 text-white/70">RipoDoc is the controlled evidence-delivery layer for MSP client reports. Keep the report familiar. Make a selected claim accountable.</p><a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 border border-[#efd66b] bg-[#efd66b] px-3.5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.11em] text-[#1d1a16] transition hover:bg-white"><Code2 className="h-4 w-4" aria-hidden="true" /> Inspect the open-source build <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a></div><FooterColumn title="Product index" links={productLinks} /><FooterColumn title="Trust boundary" links={trustLinks} /><FooterColumn title="Legal status" links={legalLinks} /></div><div className="flex flex-col gap-4 pt-7 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} RipoDoc. Every reported number deserves an answer.</p><div className="flex flex-wrap items-center gap-x-4 gap-y-2"><CookieSettingsButton /><p className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[#efd66b]" aria-hidden="true" /> Public status pages describe verified boundaries; they are not final contracts.</p></div></div></div>
  </footer>;
}

function FooterColumn({ title, links }: { readonly title: string; readonly links: readonly { readonly href: string; readonly label: string; readonly external?: boolean }[] }) { return <div><h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#efd66b]">{title}</h2><ul className="mt-5 space-y-3 text-sm text-white/70">{links.map((link) => <li key={link.href}>{link.external ? <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-white">{link.label}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></a> : <Link href={link.href} className="transition hover:text-white">{link.label}</Link>}</li>)}</ul></div>; }
