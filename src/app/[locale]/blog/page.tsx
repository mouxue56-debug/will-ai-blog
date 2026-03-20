import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { BlogList } from '@/components/blog/blog-list';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return {
    title: t('page_title'),
    description: `${t('page_desc')} — Will${t('page_subtitle')}`,
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
