'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname as useNextPathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const fallbackLocale = useLocale();
  const t = useTranslations('common.locale_names');
  const nextPathname = useNextPathname();
  const pathSegments = nextPathname.split('/').filter(Boolean);
  const pathLocale = routing.locales.includes(pathSegments[0] as (typeof routing.locales)[number])
    ? (pathSegments[0] as (typeof routing.locales)[number])
    : fallbackLocale;
  const normalizedPathname =
    pathSegments.length > 0 && pathSegments[0] === pathLocale
      ? `/${pathSegments.slice(1).join('/')}` || '/'
      : nextPathname || '/';

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((l) => {
        const isActive = l === pathLocale;

        return (
          <Link
            key={l}
            href={normalizedPathname}
            locale={l}
            prefetch={false}
            className={`rounded-md font-medium no-underline cursor-pointer ${
              compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
            } ${
              isActive
                ? 'bg-brand-mint/15 text-brand-mint dark:bg-brand-mint/20 dark:text-brand-mint'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {t(l)}
          </Link>
        );
      })}
    </div>
  );
}
