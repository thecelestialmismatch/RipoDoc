'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';

const NAV_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/for-msps', label: 'For MSPs' },
  { href: '/security', label: 'Security' },
  { href: '/download', label: 'Self-host' },
] as const;

const isActive = (pathname: string, href: string): boolean => pathname === href || (href === '/for-msps' && pathname.startsWith('/for-msps')) || (href === '/security' && pathname.startsWith('/security'));

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return <header className="sticky top-0 z-50 border-b border-[#d9e1ec] bg-white/95 text-[#0f1b2d] backdrop-blur">
    <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-5 sm:px-6 lg:px-8">
      <Link href="/" className="rounded-lg py-2" onClick={() => setMobileOpen(false)} aria-label="RipoDoc home"><BrandLockup compact /></Link>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
        {NAV_LINKS.map((link) => <Link key={link.href} href={link.href} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive(pathname, link.href) ? 'bg-[#e8f1ff] text-[#143ea6]' : 'text-[#526176] hover:bg-[#f1f5fa] hover:text-[#0f1b2d]'}`}>{link.label}</Link>)}
      </nav>
      <div className="hidden lg:block"><Link href="/founding-partners" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#245cff] px-4 text-sm font-bold text-white transition hover:bg-[#143ea6]">Open a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      <button type="button" onClick={() => setMobileOpen((open) => !open)} className="grid h-11 w-11 place-items-center rounded-lg border border-[#d9e1ec] text-[#0f1b2d] transition hover:bg-[#f1f5fa] lg:hidden" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen}>{mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}</button>
    </div>
    {mobileOpen && <div className="border-t border-[#d9e1ec] bg-white px-5 py-4 shadow-lg lg:hidden"><nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile primary navigation">{NAV_LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`rounded-lg px-4 py-3 text-sm font-semibold ${isActive(pathname, link.href) ? 'bg-[#e8f1ff] text-[#143ea6]' : 'text-[#526176] hover:bg-[#f1f5fa]'}`}>{link.label}</Link>)}<Link href="/founding-partners" onClick={() => setMobileOpen(false)} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#245cff] px-4 text-sm font-bold text-white">Open a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></nav></div>}
  </header>;
}
