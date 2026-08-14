import type { MetadataRoute } from 'next';
import { legalDocuments } from '@/lib/launch/legal.ts';

const baseUrl = 'https://www.ripodoc.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/how-it-works`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/security`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/download`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/founding-partners`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/legal`, changeFrequency: 'monthly', priority: 0.7 },
  ];

  return [...publicPages, ...legalDocuments.map((document) => ({ url: `${baseUrl}${document.href}`, changeFrequency: 'monthly' as const, priority: 0.5 }))];
}
