import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cattery' });
  const title = t('page_title');
  const description = t('page_desc');
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
      canonical: `https://aiblog.fuluckai.com/${locale}/cattery`,
      languages: {
        'zh-CN': '/zh/cattery',
        ja: '/ja/cattery',
        en: '/en/cattery',
        'x-default': '/zh/cattery',
      },
    },
  };
}

export default function CatteryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
