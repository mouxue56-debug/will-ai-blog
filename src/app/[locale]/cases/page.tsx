'use client';

import { useLocale, useTranslations } from 'next-intl';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { CaseCard } from '@/components/cases/case-card';
import { cases } from '@/data/cases';
import Image from 'next/image';
import { getIllustrationUrl } from '@/lib/storage';

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
          <div className="glass-card mb-10 overflow-hidden rounded-3xl">
            <div className="relative h-48 w-full sm:h-56">
              <Image
                src={getIllustrationUrl('cases-banner')}
                alt="Cases banner"
                fill
                className="object-cover object-center opacity-55 dark:opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,209,220,0.5)] via-[rgba(232,213,245,0.35)] to-[rgba(200,245,228,0.35)] dark:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/55 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('title')}</h1>
                <p className="mt-2 text-base text-muted-foreground sm:text-lg">{t('subtitle')}</p>
                <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground/80">{pageIntro}</p>
              </div>
            </div>
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
