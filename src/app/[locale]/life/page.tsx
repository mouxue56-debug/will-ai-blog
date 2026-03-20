'use client';

import { useTranslations } from 'next-intl';
import { PageTransition } from '@/components/shared/PageTransition';
import { LifeGrid } from '@/components/life/life-grid';

export default function LifePage() {
  const t = useTranslations('life');

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold">{t('title')}</h1>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg">{t('subtitle')}</p>
        </div>

        {/* Coming soon notice */}
        <div className="glass-card p-4 sm:p-5 mb-8 text-center">
          <p className="text-sm text-muted-foreground">
            ✨ 真实内容即将上线，敬请期待
          </p>
        </div>

        <LifeGrid />
      </div>
    </PageTransition>
  );
}
