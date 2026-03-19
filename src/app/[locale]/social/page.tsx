'use client';

import { useTranslations } from 'next-intl';
import { PageTransition } from '@/components/shared/PageTransition';
import { SocialSections } from '@/components/social/social-sections';

export default function SocialPage() {
  const t = useTranslations('social');

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">{t('title')}</h1>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg">{t('subtitle')}</p>
        </div>
        <SocialSections />
      </div>
    </PageTransition>
  );
}
