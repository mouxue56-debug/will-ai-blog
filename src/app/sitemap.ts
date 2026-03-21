import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { cases } from '@/data/cases';
import { debates } from '@/data/debates';

const BASE_URL = 'https://aiblog.fuluckai.com';
const locales = ['zh', 'ja', 'en'] as const;

const withAlternates = (path: string) => ({
  languages: Object.fromEntries(
    locales.map((locale) => [locale === 'zh' ? 'zh-CN' : locale, `${BASE_URL}/${locale}${path}`])
  ),
});

function safeDate(value?: string) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  const staticPages = ['', '/blog', '/digest', '/cases', '/debate', '/timeline', '/about', '/cattery'];

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: withAlternates(page),
      });
    }
  }

  const posts = getAllPosts();
  for (const post of posts) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: safeDate(post.date),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: withAlternates(`/blog/${post.slug}`),
      });
    }
  }

  for (const c of cases) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/cases/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: withAlternates(`/cases/${c.slug}`),
      });
    }
  }

  for (const debate of debates) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/debate/${debate.id}`,
        lastModified: safeDate(debate.date),
        changeFrequency: 'daily',
        priority: 0.7,
        alternates: withAlternates(`/debate/${debate.id}`),
      });
    }
  }

  return entries;
}
