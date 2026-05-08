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

// Production security headers — applied to all routes.
// Vercel adds HSTS automatically at the edge, but defining it here makes
// the policy explicit and consistent across environments (incl. local prod).
const securityHeaders = [
  // Force HTTPS for 2 years incl. subdomains; safe to preload once stable.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Prevent clickjacking. SAMEORIGIN allows in-app iframes (e.g. /api/og previews).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Stop MIME-sniffing attacks.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Modest leak of referer to same-origin only on cross-origin nav.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable powerful browser APIs we don't use.
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()',
  },
  // X-XSS-Protection is deprecated/harmful on modern browsers; intentionally omitted.
];

const nextConfig: NextConfig = {
  // Pin workspace root so Next.js does not pick up a stale lockfile
  // from $HOME/package-lock.json (which silently changes file tracing)
  outputFileTracingRoot: path.resolve('.'),
  // Drop `X-Powered-By: Next.js` header — leaks tech stack to attackers
  // for free (one less reconnaissance signal). Functionality unaffected.
  poweredByHeader: false,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'tafbypudxuksfwrkfbxv.supabase.co' },
      { protocol: 'https', hostname: 'aiblog.fuluckai.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/daoge',
        destination: 'https://daoge-chat.vercel.app/daoge',
        permanent: false,
      },
      {
        source: '/daoge/:path*',
        destination: 'https://daoge-chat.vercel.app/daoge/:path*',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply security headers to every route.
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(withMDX(nextConfig));
