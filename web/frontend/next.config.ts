import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const configDirectory = dirname(fileURLToPath(import.meta.url));

const privateSearchExclusions = [
  '/dashboard/:path*',
  '/upload/:path*',
  '/admin/:path*',
  '/login/:path*',
  '/signup/:path*',
  '/forgot-password/:path*',
  '/reset-password/:path*',
  '/verify-email/:path*',
  '/e/:path*',
] as const;

const securityHeaders: { key: string; value: string }[] = [
  { key: 'Content-Security-Policy', value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; media-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests" },
  { key: 'Permissions-Policy', value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      ...privateSearchExclusions.map((source) => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' }],
      })),
    ];
  },
  turbopack: {
    root: resolve(configDirectory, '../..'),
    // The published-manifest route deliberately reads a configured filesystem root.
    // Next 16.2 emits a known NFT trace warning even when turbopackIgnore is applied.
    ignoreIssue: [
      {
        path: '**/next.config.ts',
        title: 'Encountered unexpected file in NFT list',
      },
    ],
  },
};

export default nextConfig;
