import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/how-it-works', '/security', '/download', '/founding-partners', '/legal'],
        disallow: ['/api/', '/dashboard', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'],
      },
    ],
    sitemap: 'https://www.ripodoc.com/sitemap.xml',
    host: 'https://www.ripodoc.com',
  };
}
