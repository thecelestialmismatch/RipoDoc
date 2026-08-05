import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Image
                src="/ripodoc-logo.png"
                alt="RipoDoc logo"
                width={32}
                height={32}
                className="rounded-lg object-contain"
              />
              <span className="text-lg font-bold">RipoDoc</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-slate-600">
              The secure reporting delivery and evidence layer for MSPs. Send a normal PDF where
              every figure is clickable, recipient-bound and audited.
            </p>
            <p className="mt-4 text-xs text-slate-400">
              Pre-revenue, validation phase. The interaction and overlay are implemented and verified
              end to end. The authoring UI and PSA connectors are not built yet.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/#demo" className="hover:text-blue-700 transition">Live demo</Link></li>
              <li><Link href="/upload" className="hover:text-blue-700 transition">Upload PDF</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-700 transition">Dashboard</Link></li>
              <li><Link href="/security" className="hover:text-blue-700 transition">Security model</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="https://github.com/thecelestialmismatch/RipoDoc" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition">GitHub repository</a></li>
              <li><a href="https://github.com/thecelestialmismatch/RipoDoc/blob/main/docs/00-strategy/master-plan.md" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition">Master plan</a></li>
              <li><a href="https://github.com/thecelestialmismatch/RipoDoc/blob/main/docs/02-product/prd.md" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition">Product requirements</a></li>
              <li><a href="https://github.com/thecelestialmismatch/RipoDoc/blob/main/docs/02-product/interaction-spec.md" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition">Interaction spec</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          <p>RipoDoc &mdash; Built for MSPs who send client reports and get asked <em>&ldquo;where did that number come from?&rdquo;</em></p>
        </div>
      </div>
    </footer>
  );
}