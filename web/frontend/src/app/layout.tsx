import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar.tsx';
import { Footer } from '@/components/Footer.tsx';
import { CookieNotice } from '@/components/CookieNotice.tsx';
import { WebVitalsReporter } from '@/components/telemetry/WebVitalsReporter.tsx';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const siteUrl = new URL('https://www.ripodoc.com');
const siteTitle = 'RipoDoc | Controlled evidence delivery for MSP client reports';
const siteDescription = 'RipoDoc turns an MSP client report into a controlled evidence experience: approved report figures can reveal recipient-scoped, expiring, auditable proof without replacing the systems that produce operational data.';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: siteTitle, template: '%s | RipoDoc' },
  description: siteDescription,
  applicationName: 'RipoDoc',
  authors: [{ name: 'RipoDoc' }],
  creator: 'RipoDoc',
  publisher: 'RipoDoc',
  category: 'Business software',
  keywords: ['MSP reporting', 'client reports', 'evidence delivery', 'PDF evidence', 'QBR reporting', 'report audit trail', 'self-hosted MSP software'],
  alternates: { canonical: '/' },
  icons: { icon: '/ripodoc-mark.png', shortcut: '/ripodoc-mark.png', apple: '/ripodoc-mark.png' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'RipoDoc',
    title: siteTitle,
    description: siteDescription,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'RipoDoc — controlled evidence delivery for MSP client reports' }],
  },
  twitter: { card: 'summary_large_image', title: siteTitle, description: siteDescription, images: ['/opengraph-image'] },
};

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://www.ripodoc.com/#organization',
    name: 'RipoDoc',
    url: siteUrl.toString(),
    logo: 'https://www.ripodoc.com/ripodoc-mark.png',
    description: 'RipoDoc provides controlled evidence delivery for MSP client reports.',
    sameAs: ['/founding-partners'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.ripodoc.com/#website',
    name: 'RipoDoc',
    alternateName: ['RipoDoc evidence delivery', 'ripodoc.com'],
    url: siteUrl.toString(),
    description: siteDescription,
    publisher: { '@id': 'https://www.ripodoc.com/#organization' },
    inLanguage: 'en-US',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://www.ripodoc.com/#software',
    name: 'RipoDoc',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Evidence delivery for MSP client reports',
    operatingSystem: 'Web, Linux (self-hosted)',
    url: siteUrl.toString(),
    description: siteDescription,
    publisher: { '@id': 'https://www.ripodoc.com/#organization' },
    featureList: [
      'Controlled proof views linked to approved report figures',
      'Recipient-scoped, time-limited evidence access',
      'Evidence provenance and audit-aware delivery',
      'Self-hosted deployment with PostgreSQL and a private authoring worker',
    ],
  },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
    <body className="flex min-h-full flex-col bg-[#09101a] text-[#f2f3ef] [color-scheme:dark]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <Navbar />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
      <CookieNotice />
      <WebVitalsReporter />
    </body>
  </html>;
}
