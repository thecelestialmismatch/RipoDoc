import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';

const productLinks = [
  { href: '/#demo', label: 'Interactive demo' },
  { href: '/upload', label: 'Create report' },
  { href: '/dashboard', label: 'Client workspace' },
  { href: '/security', label: 'Security controls' },
] as const;

const resourceLinks = [
  { href: 'https://github.com/thecelestialmismatch/RipoDoc', label: 'GitHub repository' },
  { href: 'https://github.com/thecelestialmismatch/RipoDoc/blob/main/docs/00-strategy/master-plan.md', label: 'Master plan' },
  { href: 'https://github.com/thecelestialmismatch/RipoDoc/blob/main/docs/02-product/prd.md', label: 'Product requirements' },
  { href: 'https://github.com/thecelestialmismatch/RipoDoc/blob/main/docs/02-product/interaction-spec.md', label: 'Interaction specification' },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#F6F8FC]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.3fr_0.65fr_0.8fr]">
          <div>
            <BrandLockup showDescriptor />
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-600">
              The secure reporting delivery and evidence layer for MSPs. Send a normal PDF where every figure is clickable, recipient-bound, and auditable.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#087E84]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#12B9BE]" aria-hidden="true" />
              Evidence workflow ready for deployment
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#11162E]">Product</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {productLinks.map((link) => (
                <li key={link.href}><Link href={link.href} className="transition hover:text-[#1769E8]">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#11162E]">Resources</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition hover:text-[#1769E8]">
                    {link.label}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RipoDoc. Built for clear, defensible MSP client reporting.</p>
          <p>Every reported number deserves its evidence.</p>
        </div>
      </div>
    </footer>
  );
}
