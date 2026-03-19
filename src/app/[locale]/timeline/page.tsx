'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from '@/components/shared/PageTransition';
import { timelineData, categoryConfig, type TimelineCategory } from '@/data/timeline';

const INITIAL_COUNT = 15;
const LOAD_MORE_COUNT = 10;

type FilterType = 'all' | TimelineCategory;

function TimelineEntry({
  entry,
  index,
  locale,
  isExpanded,
  onToggle,
  t,
}: {
  entry: (typeof timelineData)[0];
  index: number;
  locale: string;
  isExpanded: boolean;
  onToggle: () => void;
  t: (key: string) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isLeft = index % 2 === 0;
  const config = categoryConfig[entry.category];
  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en' ? locale : 'en') as 'zh' | 'ja' | 'en';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const formattedDate = useMemo(() => {
    const d = new Date(entry.date);
    if (locale === 'ja') return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    if (locale === 'zh') return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, [entry.date, locale]);

  return (
    <div ref={ref} className="relative flex w-full md:items-center">
      {/* Desktop: alternating layout */}
      <motion.div
        initial={{ opacity: 0, y: 30, x: isLeft ? -20 : 20 }}
        animate={isVisible ? { opacity: 1, y: 0, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.05 * (index % 5), ease: 'easeOut' }}
        className={`
          w-full
          md:w-[calc(50%-2rem)]
          ${isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}
          pl-10 md:pl-0
        `}
      >
        <button
          onClick={onToggle}
          className="w-full text-left group cursor-pointer"
          aria-expanded={isExpanded}
        >
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border group-focus-visible:ring-2 group-focus-visible:ring-ring">
            {/* Category badge + date */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: config.color + '18', color: config.color }}
              >
                <span>{config.icon}</span>
                {t(`timeline.category.${entry.category}`)}
              </span>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-semibold leading-snug mb-1.5">
              {entry.title[lang]}
            </h3>

            {/* Summary */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {entry.summary[lang]}
            </p>

            {/* Expand indicator */}
            <div className="mt-2 text-xs text-muted-foreground/60 flex items-center gap-1">
              <motion.span
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                ▶
              </motion.span>
              {isExpanded ? t('timeline.collapse') : t('timeline.expand')}
            </div>
          </div>
        </button>

        {/* Expanded detail */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-lg border border-border/30 bg-muted/30 p-4 text-sm leading-relaxed text-foreground/80">
                {entry.content[lang]}
                {entry.blogSlug && (
                  <a
                    href={`/${locale}/blog/${entry.blogSlug}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: config.color }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t('timeline.readMore')} →
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Center dot - desktop */}
      <div
        className={`
          absolute
          left-0 md:left-1/2 md:-translate-x-1/2
          top-6
          w-4 h-4 rounded-full border-[3px] border-background z-10 shadow-sm
        `}
        style={{ backgroundColor: config.color }}
      />
    </div>
  );
}

export default function TimelinePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [filter, setFilter] = useState<FilterType>('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    const entries = filter === 'all'
      ? timelineData
      : timelineData.filter((e) => e.category === filter);
    return entries;
  }, [filter]);

  const visibleEntries = useMemo(
    () => filteredEntries.slice(0, visibleCount),
    [filteredEntries, visibleCount]
  );

  const hasMore = visibleCount < filteredEntries.length;

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setVisibleCount(INITIAL_COUNT);
    setExpandedId(null);
  };

  const filters: { key: FilterType; labelKey: string }[] = [
    { key: 'all', labelKey: 'timeline.filter.all' },
    { key: 'tech', labelKey: 'timeline.filter.tech' },
    { key: 'daily', labelKey: 'timeline.filter.daily' },
    { key: 'milestone', labelKey: 'timeline.filter.milestone' },
    { key: 'reflection', labelKey: 'timeline.filter.reflection' },
  ];

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            {t('timeline.title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('timeline.subtitle')}
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map(({ key, labelKey }) => {
            const isActive = filter === key;
            const color = key === 'all' ? undefined : categoryConfig[key as TimelineCategory]?.color;
            return (
              <button
                key={key}
                onClick={() => handleFilterChange(key)}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  border cursor-pointer
                  ${isActive
                    ? 'text-white shadow-sm'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  }
                `}
                style={isActive ? {
                  backgroundColor: color || 'var(--color-foreground)',
                  borderColor: color || 'var(--color-foreground)',
                } : undefined}
              >
                {key !== 'all' && (
                  <span className="mr-1">{categoryConfig[key as TimelineCategory]?.icon}</span>
                )}
                {t(labelKey)}
              </button>
            );
          })}
        </div>

        {/* Count */}
        <div className="text-center text-sm text-muted-foreground mb-8">
          {t('timeline.count', { count: filteredEntries.length })}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-[7px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border/60" />

          {/* Entries */}
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-6 sm:gap-8">
              {visibleEntries.map((entry, i) => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  index={i}
                  locale={locale}
                  isExpanded={expandedId === entry.id}
                  onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  t={t}
                />
              ))}
            </div>
          </AnimatePresence>

          {/* End dot */}
          <div className="absolute left-[3px] md:left-1/2 md:-translate-x-1/2 bottom-0 w-3 h-3 rounded-full bg-border" />
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
              className="px-6 py-2.5 rounded-full border border-border text-sm font-medium
                         hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              {t('timeline.loadMore')}
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
