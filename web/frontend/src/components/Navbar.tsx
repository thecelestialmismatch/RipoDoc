'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Download, LayoutDashboard, Menu, ShieldCheck, UsersRound, X, type LucideIcon } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';

const NAV_LINKS: readonly { readonly href: string; readonly label: string; readonly icon?: LucideIcon }[] = [
  { href: '/#product', label: 'Product' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/security', label: 'Security', icon: ShieldCheck },
  { href: '/founding-partners', label: 'Founding partners', icon: UsersRound },
  { href: '/download', label: 'Self-host', icon: Download },
  { href: '/dashboard', label: 'Client workspace', icon: LayoutDashboard },
];

const linkClass = (active: boolean) =>
  `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
    active ? 'bg-[#EAF5FF] text-[#0A3E9B]' : 'text-slate-600 hover:bg-slate-100 hover:text-[#11162E]'
  }`;

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6">
        <Link href="/" className="rounded-lg transition-opacity hover:opacity-85" onClick={() => setMobileOpen(false)} aria-label="RipoDoc home">
          <BrandLockup compact />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const active = link.href === pathname;
            return <Link key={link.href} href={link.href} className={linkClass(active)}>{Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}{link.label}</Link>;
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-[#11162E]">GitHub</a>
          <Link href="/founding-partners" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1769E8] to-[#12B9BE] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(23,105,232,0.8)] transition duration-200 hover:brightness-105 active:scale-[0.98]">
            <UsersRound className="h-4 w-4" aria-hidden="true" />Request diagnostic
          </Link>
        </div>

        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="rounded-lg p-2.5 text-slate-700 transition hover:bg-slate-100 lg:hidden" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && <div className="border-t border-slate-200 bg-white px-5 py-4 shadow-lg lg:hidden"><nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile primary navigation">
        {NAV_LINKS.map((link) => { const Icon = link.icon; const active = link.href === pathname; return <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={linkClass(active)}>{Icon && <Icon className="h-4 w-4" aria-hidden="true" />}{link.label}</Link>; })}
        <Link href="/founding-partners" onClick={() => setMobileOpen(false)} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1769E8] to-[#12B9BE] px-4 py-2.5 text-sm font-semibold text-white"><UsersRound className="h-4 w-4" aria-hidden="true" />Request a report diagnostic</Link>
      </nav></div>}
    </header>
  );
}
