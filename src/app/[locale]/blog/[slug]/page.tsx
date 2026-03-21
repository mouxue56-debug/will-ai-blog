import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getAllPosts, getPostBySlug, getAdjacentPosts, getSampleComments } from '@/lib/blog';
import { BlogDetail } from '@/components/blog/blog-detail';

const SITE_URL = 'https://aiblog.fuluckai.com';

export function generateStaticParams() {
  const posts = getAllPosts();
  const locales = ['zh', 'ja', 'en'];
  return locales.flatMap((locale) => posts.map((post) => ({ locale, slug: post.slug })));
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\u3040-\u30ff]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractHeadings(content: string) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Array<{ id: string; text: string; level: 2 | 3 }> = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();

    if (level === 2 || level === 3) {
      headings.push({
        id: slugifyHeading(text),
        text,
        level,
      });
    }
  }

  return headings;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: 'Not Found' };
  }

  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en') ? locale : 'zh';
  const title = post.title[lang] || post.title.zh || post.slug;
  const description = post.excerpt[lang] || post.excerpt.zh || '';
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&lang=${encodeURIComponent(lang)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${title} OG image`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      languages: {
        'zh-CN': `/zh/blog/${slug}`,
        ja: `/ja/blog/${slug}`,
        en: `/en/blog/${slug}`,
        'x-default': `/zh/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);
  const comments = getSampleComments();
  const headings = extractHeadings(post.content);
  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en') ? locale : 'zh';
  const titleZh = post.title.zh || post.title[lang] || slug;
  const titleJa = post.title.ja || titleZh;
  const titleEn = post.title.en || titleZh;
  const description = post.excerpt[lang] || post.excerpt.zh || titleZh;
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(post.title[lang] || post.title.zh || slug)}&lang=${encodeURIComponent(lang)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: titleZh,
    alternativeHeadline: {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'ListItem', name: titleJa },
        { '@type': 'ListItem', name: titleEn },
      ],
    },
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: {
      '@type': 'Person',
      name: 'Will',
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: "Will's AI Blog",
      url: SITE_URL,
    },
    description,
    inLanguage: ['zh', 'ja', 'en'],
    url: `${SITE_URL}/${lang}/blog/${slug}`,
    keywords: post.tags?.length ? post.tags.join(', ') : undefined,
    image: ogImageUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogDetail
        post={post}
        prevPost={prev}
        nextPost={next}
        comments={comments}
        postSlug={slug}
        headings={headings}
      />
    </>
  );
}
