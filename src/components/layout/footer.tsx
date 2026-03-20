'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="pb-20 md:pb-0">
      {/* Gradient divider line */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-brand-mint to-brand-cyan opacity-40" />
      </div>

      {/* Simple one-line footer */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>© 2026 Will AI Lab</p>
          <div className="flex items-center gap-3">
            <a
              href="https://fuluckai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-mint transition-colors"
            >
              fuluckai.com
            </a>
            <span className="text-border">·</span>
            <a
              href="https://fuluck-cattery.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-mint transition-colors"
            >
              {t('cattery')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
