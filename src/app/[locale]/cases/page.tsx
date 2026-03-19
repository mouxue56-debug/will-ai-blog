'use client';

import { useLocale, useTranslations } from 'next-intl';
import { PageTransition } from '@/components/shared/PageTransition';
import { CaseCard } from '@/components/cases/case-card';
import { cases } from '@/data/cases';

export default function CasesPage() {
  const t = useTranslations('cases');
  const locale = useLocale();

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Page header */}
        <div className="space-y-2 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Case cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <CaseCard key={c.slug} c={c} locale={locale} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
