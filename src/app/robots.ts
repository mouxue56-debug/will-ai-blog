import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
      { userAgent: 'GPTBot', allow: '/blog/', disallow: '/admin' },
      { userAgent: 'CCBot', allow: '/', disallow: '/admin' },
    ],
    sitemap: 'https://aiblog.fuluckai.com/sitemap.xml',
  };
}
