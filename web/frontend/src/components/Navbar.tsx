'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, ShieldCheck, X, type LucideIcon } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';

const NAV_LINKS: readonly { readonly href: string; readonly label: string; readonly icon?: LucideIcon }[] = [
  { href: '/#sample-report', label: 'Sample' },
  { href: '/how-it-works', label: 'Method' },
  { href: '/for-msps', label: 'For MSPs' },
  { href: '/report-evidence-readiness', label: 'Readiness' },
  { href: '/security', label: 'Controls', icon: ShieldCheck },
  { href: '/download', label: 'Self-host' },
] as const;

const linkClass = (active: boolean) => `inline-flex items-center gap-1.5 border-b-2 px-2.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.09em] transition ${active ? 'border-[#d9503b] text-[#1d1a16]' : 'border-transparent text-[#5f594f] hover:border-[#1d1a16] hover:text-[#1d1a16]'}`;

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return <header className="sticky top-0 z-50 border-b border-[#1d1a16] bg-[#f6f0e5]/95 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6">
      <Link href="/" className="transition-opacity hover:opacity-85" onClick={() => setMobileOpen(false)} aria-label="RipoDoc home"><BrandLockup compact /></Link>
      <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary navigation">{NAV_LINKS.map((link) => { const Icon = link.icon; const active = pathname === link.href || (link.href.startsWith('/#') && pathname === '/'); return <Link key={link.href} href={link.href} className={linkClass(active)}>{Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}{link.label}</Link>; })}</nav>
      <div className="hidden items-center gap-2 lg:flex"><a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#5f594f] transition hover:text-[#a62f26]">GitHub <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></a><Link href="/founding-partners" className="inline-flex min-h-10 items-center gap-2 border border-[#1d1a16] bg-[#d9503b] px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_#1d1a16] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Request diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      <button type="button" onClick={() => setMobileOpen((open) => !open)} className="border border-[#1d1a16] bg-[#fffdf8] p-2.5 text-[#1d1a16] lg:hidden" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen}>{mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}</button>
    </div>
    {mobileOpen && <div className="border-t border-[#1d1a16] bg-[#fffdf8] px-5 py-4 shadow-[0_6px_0_rgb(29_26_22_/_0.12)] lg:hidden"><nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile primary navigation">{NAV_LINKS.map((link) => { const Icon = link.icon; const active = pathname === link.href || (link.href.startsWith('/#') && pathname === '/'); return <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={linkClass(active)}>{Icon && <Icon className="h-4 w-4" aria-hidden="true" />}{link.label}</Link>; })}<Link href="/founding-partners" onClick={() => setMobileOpen(false)} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 border border-[#1d1a16] bg-[#d9503b] px-4 py-2.5 text-sm font-bold text-white">Request a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></nav></div>}
  </header>;
}
