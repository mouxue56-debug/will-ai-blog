'use client';

import { useTranslations } from 'next-intl';
import { PageTransition } from '@/components/shared/PageTransition';

export default function CasesPage() {
  const t = useTranslations('nav');
  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold">{t('cases')}</h1>
        <p className="mt-4 text-muted-foreground">Coming soon...</p>
      </div>
    </PageTransition>
  );
}
