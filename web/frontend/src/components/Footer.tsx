import Link from 'next/link';
import { ArrowUpRight, Code2, ShieldCheck } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';

const productLinks = [
  { href: '/#proof-view', label: 'Proof view' },
  { href: '/#how-it-works', label: 'Method' },
  { href: '/founding-partners', label: 'Report diagnostic' },
  { href: '/download', label: 'Download & self-host' },
] as const;

const trustLinks = [
  { href: '/security', label: 'Security controls' },
  { href: '/legal', label: 'Legal status' },
  { href: '/legal/healthcare-mode-b', label: 'Healthcare Mode B' },
  { href: 'https://github.com/thecelestialmismatch/RipoDoc/blob/main/docs/01-research/yc-readiness-and-venture-thesis.md', label: 'YC-readiness research', external: true },
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
  return (
    <footer className="bg-[#081126] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:py-16">
        <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.3fr_0.58fr_0.72fr_0.78fr]">
          <div>
            <BrandLockup showDescriptor />
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">The controlled evidence-delivery layer for MSP client reports. Keep the PDF familiar. Keep the claim accountable.</p>
            <a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 border border-white/20 px-3.5 py-2.5 text-sm font-bold text-white transition hover:border-teal-300 hover:text-teal-100"><Code2 className="h-4 w-4" aria-hidden="true" /> Inspect the open-source build <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Trust & research" links={trustLinks} />
          <FooterColumn title="Legal status" links={legalLinks} />
        </div>
        <div className="flex flex-col gap-4 pt-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RipoDoc. Every reported number deserves its evidence.</p>
          <p className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" /> Public status pages describe verified boundaries; they are not final contracts.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { readonly title: string; readonly links: readonly { readonly href: string; readonly label: string; readonly external?: boolean }[] }) {
  return <div><h2 className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">{title}</h2><ul className="mt-5 space-y-3 text-sm text-slate-300">{links.map((link) => <li key={link.href}>{link.external ? <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-white">{link.label}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></a> : <Link href={link.href} className="transition hover:text-white">{link.label}</Link>}</li>)}</ul></div>;
}
