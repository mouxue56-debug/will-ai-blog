import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { BlogList } from '@/components/blog/blog-list';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const title = t('page_title');
  const description = `${t('page_desc')} — Will${t('page_subtitle')}`;
  const ogImageUrl = `https://aiblog.fuluckai.com/api/og?title=${encodeURIComponent(title)}&lang=${encodeURIComponent(locale)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
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
        zh: '/zh/blog',
        ja: '/ja/blog',
        en: '/en/blog',
      },
    },
  };
}

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogList posts={posts} />;
}
