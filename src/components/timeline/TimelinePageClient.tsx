'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { type TimelineEntry, categoryConfig } from '@/data/timeline';
import { Link } from '@/i18n/navigation';
import { aiInstanceColors } from '@/data/news';

function formatDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function TimelinePageClient({
  events,
  locale,
}: {
  events: TimelineEntry[];
  locale: 'zh' | 'ja' | 'en';
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
              key={entry.id}
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
                  className={[
                    'glass-card shadow-sm transition-all duration-200 hover:shadow-md p-4 sm:p-5',
                    entry.isMilestone ? 'border-l-4' : '',
                    entry.isMilestone && isLeft ? 'md:border-r-4 md:border-l-0' : '',
                  ].join(' ')}
                  style={entry.isMilestone ? { borderColor: category.color } : undefined}
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
                    {entry.isMilestone && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-brand-coral/15 text-brand-coral">
                        ⭐ {t('filter.milestone')}
                      </span>
                    )}
                  </div>

                  {entry.aiInstance && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: aiInstanceColors[entry.aiInstance] || '#94A3B8' }}
                      >
                        {entry.aiInstance.charAt(0)}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.aiInstance}</span>
                    </div>
                  )}

                  <h3 className="font-semibold text-base sm:text-lg mb-1.5">{entry.title[locale]}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{entry.summary[locale]}</p>

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

                  {(entry.blogSlug || entry.newsId || entry.link) && (
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      {entry.blogSlug && (
                        <Link href={`/blog/${entry.blogSlug}` as `/${string}`} className="text-brand-mint hover:underline">
                          {t('readMore')} →
                        </Link>
                      )}
                      {entry.newsId && (
                        <Link href={`/news/${entry.newsId}` as `/${string}`} className="text-brand-mint hover:underline">
                          {t('viewNews')} →
                        </Link>
                      )}
                      {entry.link && !entry.blogSlug && !entry.newsId && (
                        <Link href={entry.link as `/${string}`} className="text-brand-mint hover:underline">
                          {t('readMore')} →
                        </Link>
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
