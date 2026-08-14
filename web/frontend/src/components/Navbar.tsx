'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, ShieldCheck, X, type LucideIcon } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';

const NAV_LINKS: readonly { readonly href: string; readonly label: string; readonly icon?: LucideIcon }[] = [
  { href: '/#proof-view', label: 'Proof view' },
  { href: '/how-it-works', label: 'Method' },
  { href: '/security', label: 'Controls', icon: ShieldCheck },
  { href: '/download', label: 'Self-host' },
] as const;

const linkClass = (active: boolean) =>
  `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition duration-200 ${
    active ? 'bg-[#e7f0ff] text-[#17378d]' : 'text-slate-600 hover:bg-slate-100 hover:text-[#0b1226]'
  }`;

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6">
        <Link href="/" className="transition-opacity hover:opacity-85" onClick={() => setMobileOpen(false)} aria-label="RipoDoc home">
          <BrandLockup compact />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const active = link.href === pathname;
            return <Link key={link.href} href={link.href} className={linkClass(active)}>{Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}{link.label}</Link>;
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-[#17378d]">GitHub <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></a>
          <Link href="/founding-partners" className="inline-flex min-h-10 items-center gap-2 bg-[#0b1226] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#17378d] active:scale-[0.98]">Request diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>

        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="p-2.5 text-slate-700 transition hover:bg-slate-100 lg:hidden" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && <div className="border-t border-slate-200 bg-white px-5 py-4 shadow-lg lg:hidden"><nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile primary navigation">
        {NAV_LINKS.map((link) => { const Icon = link.icon; const active = link.href === pathname; return <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={linkClass(active)}>{Icon && <Icon className="h-4 w-4" aria-hidden="true" />}{link.label}</Link>; })}
        <Link href="/founding-partners" onClick={() => setMobileOpen(false)} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 bg-[#0b1226] px-4 py-2.5 text-sm font-bold text-white">Request a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
      </nav></div>}
    </header>
  );
}
