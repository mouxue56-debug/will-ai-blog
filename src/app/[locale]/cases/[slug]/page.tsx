import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { cases } from '@/data/cases';
import { CaseDetail } from '@/components/cases/case-detail';
import { PageTransition } from '@/components/shared/PageTransition';

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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
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

  return (
    <PageTransition>
      <CaseDetail caseStudy={caseStudy} locale={locale} />
    </PageTransition>
  );
}
