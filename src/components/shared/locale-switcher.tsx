'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const localeLabels: Record<string, string> = {
  zh: '中文',
  ja: '日本語',
  en: 'EN',
};

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((l) => {
        const isActive = l === locale;

        return (
          <Link
            key={l}
            href={pathname}
            locale={l}
            prefetch={false}
            className={`rounded-md font-medium no-underline cursor-pointer ${
              compact
                ? 'px-2 py-1 text-xs'
                : 'px-3 py-1.5 text-sm'
            } ${
              isActive
                ? 'bg-brand-mint/15 text-brand-mint dark:bg-brand-mint/20 dark:text-brand-mint'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {localeLabels[l]}
          </Link>
        );
      })}
    </div>
  );
}
