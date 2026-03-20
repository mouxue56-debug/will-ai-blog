import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'debate' });
  return {
    title: t('page_title'),
    description: t('page_desc'),
    alternates: {
      languages: { zh: '/zh/debate', ja: '/ja/debate', en: '/en/debate' },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
