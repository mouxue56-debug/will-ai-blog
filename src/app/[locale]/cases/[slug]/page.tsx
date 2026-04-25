import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { cases } from '@/data/cases';
import { CaseDetail } from '@/components/cases/case-detail';
import { PageTransition } from '@/components/shared/PageTransition';
import type { Locale } from '@/lib/locale';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  const locales = ['zh', 'ja', 'en'];
  return locales.flatMap((locale) => cases.map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const caseStudy = cases.find((c) => c.slug === slug);

  if (!caseStudy) {
    return { title: 'Not Found' };
  }

  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en') ? locale : 'zh';
  const title = caseStudy.title[lang];
  const description = caseStudy.subtitle[lang];
  const ogImageUrl = `https://aiblog.fuluckai.com/covers/cases/${slug}.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{
        url: ogImageUrl,
        width: 1280,
        height: 720,
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
        zh: `/zh/cases/${slug}`,
        ja: `/ja/cases/${slug}`,
        en: `/en/cases/${slug}`,
      },
    },
  };
}

export default async function CaseDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const caseStudy = cases.find((c) => c.slug === slug);
  if (!caseStudy) notFound();

  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en') ? locale : 'zh';
  const title = caseStudy.title[lang];
  const description = caseStudy.subtitle[lang];
  const ogImageUrl = `https://aiblog.fuluckai.com/covers/cases/${slug}.jpg`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: 'Will',
      url: 'https://aiblog.fuluckai.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: "Will's AI Blog",
      url: 'https://aiblog.fuluckai.com',
    },
    datePublished: '2026-03-20',
    dateModified: '2026-03-20',
    image: ogImageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://aiblog.fuluckai.com/${lang}/cases/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTransition>
        <CaseDetail caseStudy={caseStudy} locale={locale as Locale} />
      </PageTransition>
    </>
  );
}
