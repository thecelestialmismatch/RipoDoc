'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, BookOpenText, Menu, ShieldCheck, X, type LucideIcon } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';

type NavLink = { readonly href: string; readonly label: string; readonly icon?: LucideIcon };

const NAV_LINKS: readonly NavLink[] = [
  { href: '/how-it-works', label: 'Method' },
  { href: '/for-msps', label: 'For MSPs' },
  { href: '/report-diagnostic-starter-kit', label: 'Resources', icon: BookOpenText },
  { href: '/security', label: 'Controls', icon: ShieldCheck },
  { href: '/download', label: 'Self-host' },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const workspaceRoute = /^\/(dashboard|upload|admin|login|signup|forgot-password|reset-password|verify-email)(?:\/|$)/.test(pathname);

  if (workspaceRoute) {
    return (
      <header className="relative z-50 border-b border-[var(--rd-line)] bg-[var(--rd-canvas)] px-3 py-3 sm:px-5">
        <div className="signal-tool-wrap flex min-h-11 items-center justify-between gap-4">
          <Link href="/" className="transition-opacity hover:opacity-80" aria-label="RipoDoc home"><BrandLockup compact /></Link>
          <div className="inline-flex items-center gap-2 font-mono text-[.65rem] font-bold uppercase tracking-[.1em] text-[var(--rd-ink-faint)]"><span className="h-2 w-2 rounded-full bg-[var(--rd-signal)]" aria-hidden="true" />Private workspace</div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 rounded-2xl border border-[var(--rd-line)] bg-[rgb(247_249_252_/_0.90)] px-4 py-3 shadow-[0_10px_30px_rgb(16_24_39_/_0.08)] backdrop-blur-xl sm:px-5">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80 focus-visible:rounded-md focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--rd-signal)]" onClick={() => setMobileOpen(false)} aria-label="RipoDoc home">
          <BrandLockup compact />
        </Link>

        <nav className="hidden min-w-0 items-center justify-center gap-1 lg:flex" aria-label="Primary navigation">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`relative inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[0.8rem] font-semibold transition ${active ? 'bg-[var(--rd-signal-soft)] text-[var(--rd-ink)]' : 'text-[var(--rd-ink-soft)] hover:bg-white hover:text-[var(--rd-ink)]'}`}>
                {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                {label}
                {active && <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-[var(--rd-signal)]" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-[var(--rd-ink-soft)] transition hover:bg-white hover:text-[var(--rd-ink)]">
            Inspect build <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <Link href="/founding-partners" className="signal-button !min-h-10 !rounded-lg !px-3.5 !py-2 text-xs">
            Request a diagnostic <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--rd-line-strong)] bg-white text-[var(--rd-ink)] transition hover:border-[var(--rd-signal)] hover:bg-[var(--rd-signal-soft)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--rd-signal)] lg:hidden" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-[1480px] rounded-2xl border border-[var(--rd-line)] bg-[var(--rd-surface)] p-3 shadow-[0_18px_42px_rgb(16_24_39_/_0.12)] lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile primary navigation">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)} aria-current={active ? 'page' : undefined} className={`flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${active ? 'bg-[var(--rd-signal-soft)] text-[var(--rd-ink)]' : 'text-[var(--rd-ink-soft)] hover:bg-[var(--rd-canvas-alt)] hover:text-[var(--rd-ink)]'}`}>
                  {Icon && <Icon className="h-4 w-4 text-[var(--rd-signal)]" aria-hidden="true" />}
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 grid gap-2 border-t border-[var(--rd-line)] pt-3">
            <Link href="/founding-partners" onClick={() => setMobileOpen(false)} className="signal-button">
              Request a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="signal-button-secondary">
              Inspect the open-source build <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
