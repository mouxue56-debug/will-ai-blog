import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { cases } from '@/data/cases';
import { debates } from '@/data/debates';
import { timelineEvents } from '@/lib/timeline-data';
import { buildAbsoluteUrl, buildAlternates, locales } from '@/lib/seo';

function safeDate(value?: string) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  const staticPages = [
    '/',
    '/about',
    '/ai-join',
    '/blog',
    '/cases',
    '/cattery',
    '/debate',
    '/digest',
    '/learning',
    '/life',
    '/news',
    '/social',
    '/timeline',
  ];

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: buildAbsoluteUrl(locale, page),
        lastModified: new Date(),
        changeFrequency: page === '/' ? 'daily' : 'weekly',
        priority: page === '/' ? 1.0 : 0.8,
        alternates: buildAlternates(page),
      });
    }
  }

  const posts = getAllPosts();
  for (const post of posts) {
    for (const locale of locales) {
      entries.push({
        url: buildAbsoluteUrl(locale, `/blog/${post.slug}`),
        lastModified: safeDate(post.date),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: buildAlternates(`/blog/${post.slug}`),
      });
    }
  }

  for (const c of cases) {
    for (const locale of locales) {
      entries.push({
        url: buildAbsoluteUrl(locale, `/cases/${c.slug}`),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: buildAlternates(`/cases/${c.slug}`),
      });
    }
  }

  for (const debate of debates) {
    for (const locale of locales) {
      entries.push({
        url: buildAbsoluteUrl(locale, `/debate/${debate.id}`),
        lastModified: safeDate(debate.date),
        changeFrequency: 'daily',
        priority: 0.7,
        alternates: buildAlternates(`/debate/${debate.id}`),
      });
    }
  }

  const timelineYears = [...new Set(timelineEvents.map((entry) => entry.date.split('-')[0]))];
  for (const year of timelineYears) {
    const yearEntries = timelineEvents.filter((entry) => entry.date.startsWith(`${year}-`));
    const lastModified = safeDate(yearEntries[0]?.date);

    for (const locale of locales) {
      entries.push({
        url: buildAbsoluteUrl(locale, `/timeline/${year}`),
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: buildAlternates(`/timeline/${year}`),
      });
    }
  }

  const timelineMonths = [...new Set(timelineEvents.map((entry) => entry.date.slice(0, 7)))];
  for (const yearMonth of timelineMonths) {
    const [year, month] = yearMonth.split('-');
    const monthEntries = timelineEvents.filter((entry) => entry.date.startsWith(`${year}-${month}`));
    const lastModified = safeDate(monthEntries[0]?.date);

    for (const locale of locales) {
      entries.push({
        url: buildAbsoluteUrl(locale, `/timeline/${year}/${month}`),
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: buildAlternates(`/timeline/${year}/${month}`),
      });
    }
  }

  return entries;
}
