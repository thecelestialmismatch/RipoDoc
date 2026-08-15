import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evidence — RipoDoc',
  description: 'The approved source data behind a figure in your report.',
  /**
   * Tokenized evidence routes inherit the centralized X-Robots-Tag policy in
   * next.config.ts. The response header is authoritative for redirects and
   * prevents an App Router metadata header from weakening `nosnippet`.
   */
};

/**
 * Evidence pages are the on-screen twin of a printed report, so they render on
 * a fixed light surface rather than following the OS colour scheme. The root
 * layout's dark-mode body would otherwise leave dark text on a dark background.
 */
export default function EvidenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex-1 bg-white text-slate-900 [color-scheme:light]">
      {children}
    </div>
  );
}
