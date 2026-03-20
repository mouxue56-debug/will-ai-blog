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
  const fullPathname = usePathname();

  function getLocalizedPath(targetLocale: string) {
    const segments = fullPathname.split('/');
    if (routing.locales.includes(segments[1] as (typeof routing.locales)[number])) {
      segments[1] = targetLocale;
    } else {
      segments.splice(1, 0, targetLocale);
    }
    return segments.join('/') || '/';
  }

  function handleClick(e: React.MouseEvent, targetLocale: string) {
    e.preventDefault();
    e.stopPropagation();
    const path = getLocalizedPath(targetLocale);
    window.location.href = path;
  }

  return (
    <div className="flex items-center gap-1" style={{ position: 'relative', zIndex: 9999 }}>
      {routing.locales.map((l) => {
        const isActive = l === locale;
        const path = getLocalizedPath(l);
        return (
          <a
            key={l}
            href={path}
            onClick={(e) => handleClick(e, l)}
            style={{ 
              position: 'relative', 
              zIndex: 9999, 
              pointerEvents: 'auto',
              display: 'inline-block',
            }}
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
          </a>
        );
      })}
    </div>
  );
}
