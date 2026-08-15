import type { MetadataRoute } from 'next';
import { legalDocuments } from '@/lib/launch/legal.ts';

const baseUrl = 'https://www.ripodoc.com';
// Update this value only when a material content, metadata, or internal-link revision ships.
const lastSignificantUpdate = new Date('2026-08-15T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: lastSignificantUpdate, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/how-it-works`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/for-msps`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/report-evidence-readiness`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/report-diagnostic-starter-kit`, lastModified: lastSignificantUpdate, changeFrequency: 'monthly', priority: 0.85 },
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
