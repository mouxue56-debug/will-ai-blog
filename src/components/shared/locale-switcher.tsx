'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';

const localeLabels: Record<string, string> = {
  zh: '中文',
  ja: '日本語',
  en: 'EN',
};

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const fullPathname = usePathname(); // e.g. /zh/blog or /ja/timeline

  function getLocalizedPath(targetLocale: string) {
    // Remove current locale prefix and add target locale
    const segments = fullPathname.split('/');
    // segments[0] is "", segments[1] is the locale
    if (routing.locales.includes(segments[1] as typeof routing.locales[number])) {
      segments[1] = targetLocale;
    } else {
      segments.splice(1, 0, targetLocale);
    }
    return segments.join('/') || '/';
  }

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((l) => {
        const isActive = l === locale;
        return (
          <a
            key={l}
            href={getLocalizedPath(l)}
            className={`relative transition-all duration-200 rounded-md font-medium no-underline cursor-pointer ${
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
            {isActive && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-mint" />
            )}
          </a>
        );
      })}
    </div>
  );
}
