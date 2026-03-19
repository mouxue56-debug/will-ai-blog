import { getAllPosts } from '@/lib/blog';

const BASE_URL = 'https://aiblog.fuluckai.com';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = getAllPosts().slice(0, 20);

  const items = posts
    .map((post) => {
      const title = post.title['zh'] || post.title['en'] || post.slug;
      const description = post.excerpt['zh'] || post.excerpt['en'] || '';
      const link = `${BASE_URL}/zh/blog/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();

      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${link}</guid>
      <author>Will</author>
      <category>${post.category}</category>
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Will's AI Blog</title>
    <link>${BASE_URL}</link>
    <description>AI × 猫舎 × 大阪生活 — 一个AI实践者的真实记录</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
