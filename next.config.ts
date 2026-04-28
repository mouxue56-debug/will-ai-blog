import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';
import path from 'path';

const withNextIntl = createNextIntlPlugin(path.resolve('./src/i18n/request.ts'));

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
  // Pin workspace root so Next.js does not pick up a stale lockfile
  // from $HOME/package-lock.json (which silently changes file tracing)
  outputFileTracingRoot: path.resolve('.'),
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'tafbypudxuksfwrkfbxv.supabase.co' },
      { protocol: 'https', hostname: 'aiblog.fuluckai.com' },
    ],
  },
};

export default withNextIntl(withMDX(nextConfig));
