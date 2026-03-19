'use client';

import { useTranslations } from 'next-intl';
import { PageTransition } from '@/components/shared/PageTransition';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <section className="flex flex-col items-center justify-center py-24 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-brand-mint via-brand-cyan to-brand-taro bg-clip-text text-transparent">
              {t('hero_title')}
            </span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
            {t('hero_subtitle')}
          </p>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground/80 leading-relaxed">
            {t('hero_description')}
          </p>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { color: 'bg-brand-mint', label: 'Mint' },
              { color: 'bg-brand-coral', label: 'Coral' },
              { color: 'bg-brand-cyan', label: 'Cyan' },
              { color: 'bg-brand-mango', label: 'Mango' },
              { color: 'bg-brand-taro', label: 'Taro' },
            ].map(({ color, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-border/40 px-4 py-2"
              >
                <div className={`h-3 w-3 rounded-full ${color}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
