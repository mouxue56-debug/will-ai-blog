import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { cases } from '@/data/cases';

const BASE_URL = 'https://aiblog.fuluckai.com';
const locales = ['zh', 'ja', 'en'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = ['', '/blog', '/timeline', '/cases', '/life', '/social', '/about'];

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      });
    }
  }

  // Blog posts
  const posts = getAllPosts();
  for (const post of posts) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/blog/${post.slug}`])
          ),
        },
      });
    }
  }

  // Case studies
  for (const c of cases) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/cases/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/cases/${c.slug}`])
          ),
        },
      });
    }
  }

  return entries;
}
