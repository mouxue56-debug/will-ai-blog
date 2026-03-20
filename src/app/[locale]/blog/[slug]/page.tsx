import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getAllPosts, getPostBySlug, getAdjacentPosts, getSampleComments } from '@/lib/blog';
import { BlogDetail } from '@/components/blog/blog-detail';

export function generateStaticParams() {
  const posts = getAllPosts();
  const locales = ['zh', 'ja', 'en'];
  return locales.flatMap((locale) => posts.map((post) => ({ locale, slug: post.slug })));
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: 'Not Found' };
  }

  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en') ? locale : 'zh';
  const title = post.title[lang] || post.title['zh'] || post.slug;
  const description = post.excerpt[lang] || post.excerpt['zh'] || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en') ? locale : 'zh';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title[lang] || post.title['zh'],
    description: post.excerpt[lang] || post.excerpt['zh'],
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
      url: 'https://aiblog.fuluckai.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: "Will's AI Blog",
      url: 'https://aiblog.fuluckai.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://aiblog.fuluckai.com/${locale}/blog/${slug}`,
    },
    inLanguage: locale === 'ja' ? 'ja' : locale === 'en' ? 'en' : 'zh-CN',
    ...(post.coverImage ? { image: post.coverImage } : {}),
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
      />
    </>
  );
}
