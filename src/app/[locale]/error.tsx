'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error('[ErrorBoundary]', error.digest, error.message);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-6 py-20 max-w-md mx-auto relative">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-cyan/[0.06] rounded-full blur-[100px]" />
        </div>

        <div className="text-6xl mb-6">⚡</div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-cyan to-brand-mint bg-clip-text text-transparent mb-3">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mb-8">{t('description')}</p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-cyan/15 text-brand-cyan font-medium text-sm hover:bg-brand-cyan/25 transition-colors border border-brand-cyan/20 shadow-[0_0_20px_rgba(0,212,255,0.15)]"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  );
}
