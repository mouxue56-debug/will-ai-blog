'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { type TimelineEvent } from '@/lib/timeline-data';
import type { Locale } from '@/lib/locale';

const categoryConfig: Record<TimelineEvent['category'], { color: string; icon: string }> = {
  cattery: { color: '#f59e0b', icon: '🐾' },
  tech: { color: '#22d3ee', icon: '🔧' },
  ai: { color: '#8b5cf6', icon: '🤖' },
  life: { color: '#fb7185', icon: '🌸' },
};

function formatDate(dateStr: string, locale: Locale) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function normalizeTimelineLink(link: string, locale: Locale) {
  if (!link.startsWith('/')) return link;
  return link.replace(/^\/(zh|ja|en)(?=\/)/, `/${locale}`);
}

export function TimelinePageClient({
  events,
  locale,
}: {
  events: TimelineEvent[];
  locale: Locale;
}) {
  const t = useTranslations('timeline');

  return (
    <div className="relative">
      <div
        className="absolute left-[7px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5"
        style={{
          background: 'linear-gradient(180deg, #5eead4 0%, #22d3ee 50%, #c084fc 100%)',
        }}
      />

      <div className="flex flex-col gap-5 sm:gap-6">
        {events.map((entry, index) => {
          const category = categoryConfig[entry.category];
          const isLeft = index % 2 === 0;

          return (
            <motion.div
              key={`${entry.date}-${entry.title.en}`}
              initial={{ opacity: 0, y: 24, x: isLeft ? -20 : 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
              className="relative flex w-full"
              style={{ ['--node-left' as string]: '7px' }}
            >
              <div
                className="absolute left-0 md:left-1/2 top-6 z-10 -translate-x-1/2 md:-translate-x-1/2"
                style={{ left: 'var(--node-left)' }}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 border-background shadow-sm"
                  style={{
                    backgroundColor: category.color,
                  }}
                />
              </div>

              <div
                className={[
                  'w-full pl-8 md:w-[calc(50%-1.5rem)] md:pl-0',
                  isLeft ? 'md:mr-auto md:pr-6' : 'md:ml-auto md:pl-6',
                ].join(' ')}
              >
                <div
                  className="glass-card shadow-sm transition-all duration-200 hover:shadow-md p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${category.color}18`, color: category.color }}
                    >
                      <span>{category.icon}</span>
                      {t(`category.${entry.category}`)}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(entry.date, locale)}</span>
                  </div>

                  <h3 className="font-semibold text-base sm:text-lg mb-1.5">{entry.title[locale]}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{entry.description[locale]}</p>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.link && (
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      {entry.link.startsWith('/') ? (
                        <Link
                          href={normalizeTimelineLink(entry.link, locale) as `/${string}`}
                          className="text-brand-mint hover:underline"
                        >
                          {t('readMore')} →
                        </Link>
                      ) : (
                        <a
                          href={entry.link}
                          className="text-brand-mint hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t('readMore')} →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
