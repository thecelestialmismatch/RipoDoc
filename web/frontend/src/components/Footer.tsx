import Link from 'next/link';
import { ArrowUpRight, Code2, ShieldCheck } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';
import { CookieSettingsButton } from '@/components/CookieSettingsButton.tsx';

const productLinks = [
  { href: '/#sample-report', label: 'Interactive claim sample' },
  { href: '/how-it-works', label: 'Evidence method' },
  { href: '/for-msps', label: 'For MSPs' },
  { href: '/report-evidence-readiness', label: 'Evidence-readiness check' },
  { href: '/report-diagnostic-starter-kit', label: 'Report diagnostic starter kit' },
  { href: '/guides/msp-client-reporting-qbr-metric-evidence', label: 'QBR metric evidence guide' },
] as const;

const operatingLinks = [
  { href: '/security', label: 'Security controls' },
  { href: '/download', label: 'Download & self-host' },
  { href: '/about', label: 'About RipoDoc' },
  { href: '/founding-partners', label: 'Request a diagnostic' },
  { href: '/legal/healthcare-mode-b', label: 'Healthcare Mode B' },
] as const;

const legalLinks = [
  { href: '/legal', label: 'Legal status' },
  { href: '/legal/privacy', label: 'Privacy information' },
  { href: '/legal/cookies', label: 'Cookie information' },
  { href: '/legal/terms', label: 'Terms status' },
  { href: '/legal/refunds', label: 'Refunds status' },
  { href: '/legal/sla', label: 'SLA status' },
  { href: '/legal/dpa', label: 'DPA status' },
] as const;

export function Footer() {
  return (
    <footer id="site-footer" className="mt-auto bg-[var(--rd-surface-ink)] text-[var(--rd-on-ink)]">
      <div className="signal-wrap py-12 sm:py-16 lg:py-20">
        <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.28fr_.8fr_.8fr_.8fr] lg:gap-8">
          <div>
            <BrandLockup showDescriptor inverse />
            <p className="mt-6 max-w-md text-sm leading-7 text-[var(--rd-on-ink-soft)]">RipoDoc is the controlled evidence-delivery layer for MSP client reports. Keep the report familiar. Give a selected claim an accountable proof path.</p>
            <a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/15 bg-white px-4 text-sm font-semibold text-[var(--rd-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--rd-signal-soft)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white">
              <Code2 className="h-4 w-4 text-[var(--rd-signal)]" aria-hidden="true" />
              Inspect the open-source build
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <FooterColumn title="Evidence library" links={productLinks} />
          <FooterColumn title="Operating paths" links={operatingLinks} />
          <FooterColumn title="Terms & controls" links={legalLinks} />
        </div>
        <div className="flex flex-col gap-4 pt-7 text-xs leading-5 text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RipoDoc. Every reported number deserves an answer.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <CookieSettingsButton />
            <p className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[#9bb3ff]" aria-hidden="true" /> Public pages describe verified boundaries, not final commercial contracts.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { readonly title: string; readonly links: readonly { readonly href: string; readonly label: string }[] }) {
  return (
    <div>
      <h2 className="font-mono text-[0.67rem] font-bold uppercase tracking-[0.12em] text-[#9bb3ff]">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm text-white/68">
        {links.map((link) => <li key={link.href}><Link href={link.href} className="inline-flex items-center gap-1 transition hover:text-white focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">{link.label}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></li>)}
      </ul>
    </div>
  );
}
