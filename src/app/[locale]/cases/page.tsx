'use client';

import { useLocale, useTranslations } from 'next-intl';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { CaseCard } from '@/components/cases/case-card';
import { cases } from '@/data/cases';

export default function CasesPage() {
  const t = useTranslations('cases');
  const locale = useLocale() as 'zh' | 'ja' | 'en';
  const pageIntro = {
    zh: t('page_intro_zh'),
    ja: t('page_intro_ja'),
    en: t('page_intro_en'),
  }[locale];

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        <ScrollReveal direction="fadeIn">
          <div className="mb-10 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-base text-muted-foreground sm:text-lg">{t('subtitle')}</p>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground/85 sm:text-base">
              {pageIntro}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal
          direction="fadeIn"
          stagger={0.08}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {cases.map((c) => (
            <CaseCard key={c.slug} c={c} locale={locale} />
          ))}
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
