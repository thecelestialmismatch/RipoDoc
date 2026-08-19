import type { MetadataRoute } from 'next';
import { legalDocuments } from '@/lib/launch/legal.ts';

const baseUrl = 'https://www.ripodoc.com';
// Evaluated at build time for the static sitemap. A production release therefore
// refreshes `lastmod` instead of retaining a stale manually maintained date.
const lastSignificantUpdate = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: lastSignificantUpdate, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/how-it-works`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/for-msps`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/monte-carlo-scenario-lab`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/report-evidence-readiness`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/report-diagnostic-starter-kit`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/guides/msp-client-reporting-qbr-metric-evidence`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/security`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/download`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/founding-partners`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/legal`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.7 },
  ];

  return [
    ...publicPages,
    ...legalDocuments.map((document) => ({
      url: `${baseUrl}${document.href}`,
      lastModified: lastSignificantUpdate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
