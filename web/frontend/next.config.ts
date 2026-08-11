import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const configDirectory = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
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
