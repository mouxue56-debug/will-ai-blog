'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="pb-20 md:pb-0">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-brand-mint/60 to-brand-cyan/60 opacity-50" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-3">
            <a
              href="https://fuluckai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-mint transition-colors"
            >
              fuluckai.com
            </a>
            <span className="text-border">|</span>
            <a
              href="https://fuluck-cattery.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-mint transition-colors"
            >
              {t('cattery')}
            </a>
            <span className="text-border">|</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-mint transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
