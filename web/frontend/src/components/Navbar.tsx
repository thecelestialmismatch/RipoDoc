'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';

const NAV_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/for-msps', label: 'For MSPs' },
  { href: '/security', label: 'Security boundary' },
  { href: '/download', label: 'Self-host' },
] as const;

const isActive = (pathname: string, href: string): boolean => pathname === href || (href === '/for-msps' && pathname.startsWith('/for-msps')) || (href === '/security' && pathname.startsWith('/security'));

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return <header className="sticky top-0 z-50 border-b border-[#f8f0df]/45 bg-[#e8442e] text-[#f8f0df]">
    <div className="mx-4 grid min-h-[76px] grid-cols-[1fr_auto] sm:mx-0 lg:grid-cols-[330px_1fr_250px]">
      <Link href="/" className="flex min-w-0 items-center border-r border-[#f8f0df]/45 px-5 py-3 transition-colors hover:bg-[#d83d29] sm:px-6" onClick={() => setMobileOpen(false)} aria-label="RipoDoc home"><BrandLockup compact inverse /></Link>
      <nav className="hidden items-stretch justify-center lg:flex" aria-label="Primary navigation">
        {NAV_LINKS.map((link) => <Link key={link.href} href={link.href} className={`flex items-center border-r border-[#f8f0df]/45 px-5 font-mono text-[10px] font-bold uppercase tracking-[0.11em] transition-colors ${isActive(pathname, link.href) ? 'bg-[#f8f0df] text-[#141111]' : 'text-[#f8f0df] hover:bg-[#d83d29]'}`}>{link.label}</Link>)}
      </nav>
      <div className="hidden border-l border-[#f8f0df]/45 bg-[#141111] lg:flex"><Link href="/founding-partners" className="flex w-full items-center justify-center gap-2 px-5 text-[11px] font-bold tracking-[0.04em] text-[#f8f0df] transition-colors hover:bg-[#2a2421]">Open a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      <button type="button" onClick={() => setMobileOpen((open) => !open)} className="flex min-h-[76px] items-center justify-center border-l border-[#f8f0df]/45 bg-[#141111] px-5 text-[#f8f0df] lg:hidden" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen}>{mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}</button>
    </div>
    {mobileOpen && <div className="border-t border-[#f8f0df]/45 bg-[#141111] px-5 py-5 text-[#f8f0df] lg:hidden"><nav className="grid gap-px bg-[#f8f0df]/30" aria-label="Mobile primary navigation">{NAV_LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`min-h-12 bg-[#141111] px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.11em] ${isActive(pathname, link.href) ? 'text-[#ff9b88]' : 'text-[#f8f0df]'}`}>{link.label}</Link>)}<Link href="/founding-partners" onClick={() => setMobileOpen(false)} className="mt-4 flex min-h-12 items-center justify-center gap-2 bg-[#f8f0df] px-4 py-3 text-sm font-bold text-[#141111]">Open a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></nav></div>}
  </header>;
}
