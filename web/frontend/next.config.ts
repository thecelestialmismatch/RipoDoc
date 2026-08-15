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

const nextConfig: NextConfig = {
  async headers() {
    return privateSearchExclusions.map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' }],
    }));
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
