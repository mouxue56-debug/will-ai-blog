import { getAllPosts } from '@/lib/blog';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const BASE_URL = 'https://aiblog.fuluckai.com';
const DEFAULT_AUTHOR = 'Will';

export const locales = routing.locales;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripMarkdown(content: string): string {
  return content
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_~#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

export function buildLocalePath(locale: string, pathname: string): string {
  return getPathname({
    locale: locale as (typeof routing.locales)[number],
    href: pathname as `/${string}`,
  });
}

export function buildAbsoluteUrl(locale: string, pathname: string): string {
  return `${BASE_URL}${buildLocalePath(locale, pathname)}`;
}

export function buildAlternates(pathname: string) {
  return {
    languages: Object.fromEntries(
      locales.map((locale) => [
        locale === 'zh' ? 'zh-CN' : locale,
        buildAbsoluteUrl(locale, pathname),
      ])
    ),
  };
}

function getDescription(post: ReturnType<typeof getAllPosts>[number]): string {
  const source = post.excerpt.zh || post.excerpt.ja || post.excerpt.en || stripMarkdown(post.content);
  return truncate(source, 200);
}

function safePubDate(value?: string): string {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date().toUTCString() : parsed.toUTCString();
}

export function getSortedPosts() {
  return [...getAllPosts()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function generateXML(locale: string, selfPath?: string): string {
  const resolvedLocale = locales.includes(locale as (typeof locales)[number]) ? locale : routing.defaultLocale;
  const selfUrl = selfPath
    ? `${BASE_URL}${selfPath}`
    : buildAbsoluteUrl(resolvedLocale, '/feed.xml');

  const items = getSortedPosts()
    .map((post) => {
      const link = buildAbsoluteUrl(resolvedLocale, `/blog/${post.slug}`);
      const title = [post.title.zh, post.title.ja, post.title.en].filter(Boolean).join(' | ');
      const description = getDescription(post);

      return `    <item>\n      <title>${escapeXml(title || post.slug)}</title>\n      <link>${escapeXml(link)}</link>\n      <description>${escapeXml(description)}</description>\n      <pubDate>${safePubDate(post.date)}</pubDate>\n      <guid isPermaLink="true">${escapeXml(link)}</guid>\n      <author>${escapeXml(post.author || DEFAULT_AUTHOR)}</author>\n    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>Will&apos;s AI Blog</title>\n    <link>${BASE_URL}</link>\n    <description>AI x cats x Osaka life</description>\n    <language>${resolvedLocale === 'zh' ? 'zh-CN' : resolvedLocale}</language>\n    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml"/>\n${items}\n  </channel>\n</rss>`;
}

export { BASE_URL };
