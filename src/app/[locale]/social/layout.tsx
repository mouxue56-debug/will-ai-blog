import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'social' });
  return {
    title: t('page_title'),
    description: t('page_desc'),
    alternates: {
      languages: {
        zh: '/zh/social',
        ja: '/ja/social',
        en: '/en/social',
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
