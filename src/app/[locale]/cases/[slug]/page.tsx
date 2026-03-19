import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { cases } from '@/data/cases';
import { CaseDetail } from '@/components/cases/case-detail';
import { PageTransition } from '@/components/shared/PageTransition';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
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
