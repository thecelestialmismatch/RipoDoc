import type { MetadataRoute } from 'next';

const publicDiscoveryPaths = [
  '/',
  '/how-it-works',
  '/for-msps',
  '/report-evidence-readiness',
  '/report-diagnostic-starter-kit',
  '/guides/msp-client-reporting-qbr-metric-evidence',
  '/security',
  '/download',
  '/founding-partners',
  '/about',
  '/legal',
  '/legal/privacy',
  '/legal/cookies',
  '/legal/terms',
  '/legal/refunds',
  '/legal/sla',
  '/legal/dpa',
  '/legal/healthcare-mode-b',
  '/llms.txt',
];
const privatePaths = ['/api/', '/admin', '/dashboard', '/upload', '/e/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: publicDiscoveryPaths,
        disallow: privatePaths,
      },
      {
        // AI crawler operator documents this crawler as the policy control for AI search Search.
        // The explicit rule supplements (rather than changes) the wildcard allow.
        userAgent: 'OAI-SearchBot',
        allow: publicDiscoveryPaths,
        disallow: privatePaths,
      },
    ],
    sitemap: 'https://www.ripodoc.com/sitemap.xml',
    host: 'https://www.ripodoc.com',
  };
}
