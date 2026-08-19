'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, Radar, X } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';

const NAV_LINKS = [{ href: '/how-it-works', label: 'Proof route' }, { href: '/for-msps', label: 'MSP system' }, { href: '/security', label: 'Trust architecture' }, { href: '/download', label: 'Self-host' }, { href: '/report-evidence-readiness', label: 'Readiness check' }] as const;
const isActive = (pathname: string, href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  return <header className="dense-nav"><div className="dense-nav-status"><Radar className="h-3.5 w-3.5" aria-hidden="true" /><span>RIPODOC / PROOF DELIVERY ENVIRONMENT</span><i aria-hidden="true" /><b>PUBLIC PRODUCT SITE</b></div><div className="dense-nav-main"><Link href="/" onClick={() => setMobileOpen(false)} aria-label="RipoDoc home"><BrandLockup compact inverse className="dense-brand" /></Link><nav className="dense-nav-links" aria-label="Primary navigation">{NAV_LINKS.map((link) => <Link key={link.href} href={link.href} className={isActive(pathname, link.href) ? 'is-active' : ''}>{link.label}</Link>)}</nav><Link href="/founding-partners" className="dense-nav-cta">Open a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link><button type="button" className="dense-nav-menu" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen}>{mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}</button></div>{mobileOpen && <div className="dense-nav-mobile"><nav aria-label="Mobile primary navigation">{NAV_LINKS.map((link) => <Link key={link.href} href={link.href} className={isActive(pathname, link.href) ? 'is-active' : ''} onClick={() => setMobileOpen(false)}>{link.label}</Link>)}<Link href="/founding-partners" onClick={() => setMobileOpen(false)} className="dense-nav-mobile-cta">Open a report diagnostic <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></nav></div>}</header>;
}
