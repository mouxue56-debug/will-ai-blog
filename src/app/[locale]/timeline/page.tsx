'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { timelineData, categoryConfig, type TimelineCategory, type TimelineEntry } from '@/data/timeline';
import { aiInstanceColors } from '@/data/news';

/* ─── constants ──────────────────────────────────────────── */
const INITIAL_COUNT = 20;
const LOAD_MORE_COUNT = 10;

type CategoryFilter = 'all' | TimelineCategory;
type TimeRangeFilter = 'all' | 'week' | 'month' | 'year';

/* ─── helpers ────────────────────────────────────────────── */
function formatDate(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  if (locale === 'ja') return `${d.getMonth() + 1}月${d.getDate()}日`;
  if (locale === 'zh') return `${d.getMonth() + 1}月${d.getDate()}日`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getMonthLabel(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  const m = d.getMonth();
  if (locale === 'ja') return `${m + 1}月`;
  if (locale === 'zh') return `${m + 1}月`;
  return d.toLocaleDateString('en-US', { month: 'short' });
}

function getYear(dateStr: string) {
  return new Date(dateStr).getFullYear();
}

/** Group entries into { year → { month → entries[] } }, preserving order */
function groupByYearMonth(entries: TimelineEntry[]) {
  const groups: { year: number; months: { month: string; monthKey: string; entries: TimelineEntry[] }[] }[] = [];
  let currentYear: number | null = null;
  let currentMonth: string | null = null;
  let yearGroup: (typeof groups)[0] | null = null;
  let monthGroup: (typeof groups)[0]['months'][0] | null = null;

  for (const entry of entries) {
    const y = getYear(entry.date);
    const mk = entry.date.slice(0, 7); // YYYY-MM

    if (y !== currentYear) {
      currentYear = y;
      currentMonth = null;
      yearGroup = { year: y, months: [] };
      groups.push(yearGroup);
    }

    if (mk !== currentMonth) {
      currentMonth = mk;
      monthGroup = { month: '', monthKey: mk, entries: [] };
      yearGroup!.months.push(monthGroup);
    }

    monthGroup!.entries.push(entry);
  }

  return groups;
}

function isInTimeRange(dateStr: string, range: TimeRangeFilter): boolean {
  if (range === 'all') return true;
  const now = new Date();
  const d = new Date(dateStr);
  if (range === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }
  if (range === 'month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  // year
  return d.getFullYear() === now.getFullYear();
}

/* ─── node component (the dot/diamond on the center line) ── */
function TimelineNode({ entry, shouldPulse }: { entry: TimelineEntry; shouldPulse: boolean }) {
  const config = categoryConfig[entry.category];

  // News = diamond shape
  if (entry.category === 'news') {
    return (
      <div
        className="absolute left-0 md:left-1/2 top-6 z-10 -translate-x-1/2 md:-translate-x-1/2"
        style={{ left: 'var(--node-left)' }}
      >
        <div
          className={`w-3.5 h-3.5 rotate-45 border-2 border-background shadow-sm ${shouldPulse ? 'dot-pulse' : ''}`}
          style={{
            backgroundColor: '#FBBF24', // mango
            '--pulse-color': '#FBBF2460',
          } as React.CSSProperties}
        />
      </div>
    );
  }

  // Milestone = 20px filled circle with pulse
  if (entry.isMilestone) {
    return (
      <div
        className="absolute left-0 md:left-1/2 top-5 z-10 -translate-x-1/2 md:-translate-x-1/2"
        style={{ left: 'var(--node-left)' }}
      >
        <div
          className="w-5 h-5 rounded-full border-[3px] border-background shadow-md dot-pulse"
          style={{
            backgroundColor: config.color,
            '--pulse-color': config.color + '60',
          } as React.CSSProperties}
        />
      </div>
    );
  }

  // Regular = 12px hollow circle
  return (
    <div
      className="absolute left-0 md:left-1/2 top-6 z-10 -translate-x-1/2 md:-translate-x-1/2"
      style={{ left: 'var(--node-left)' }}
    >
      <div
        className={`w-3 h-3 rounded-full border-2 bg-background shadow-sm ${shouldPulse ? 'dot-pulse' : ''}`}
        style={{
          borderColor: config.color,
          '--pulse-color': config.color + '40',
        } as React.CSSProperties}
      />
    </div>
  );
}

/* ─── single timeline card ────────────────────────────────── */
function TimelineCard({
  entry,
  index,
  locale,
  isExpanded,
  onToggle,
  t,
  shouldPulse,
}: {
  entry: TimelineEntry;
  index: number;
  locale: string;
  isExpanded: boolean;
  onToggle: () => void;
  t: (key: string) => string;
  shouldPulse: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isLeft = index % 2 === 0; // desktop: even=left, odd=right
  const config = categoryConfig[entry.category];
  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en' ? locale : 'en') as 'zh' | 'ja' | 'en';
  const isMilestone = entry.isMilestone;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const formattedDate = formatDate(entry.date, locale);

  return (
    <div
      ref={ref}
      className="relative flex w-full"
      style={{
        '--node-left': '7px',
      } as React.CSSProperties}
    >
      {/* Node on the center line */}
      <TimelineNode entry={entry} shouldPulse={shouldPulse} />

      {/* Card — desktop: alternating left/right; mobile: always right */}
      <motion.div
        initial={{ opacity: 0, y: 24, x: isLeft ? -30 : 30 }}
        animate={isVisible ? { opacity: 1, y: 0, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.04 * (index % 6), ease: 'easeOut' }}
        className={`
          w-full
          pl-8
          md:w-[calc(50%-1.5rem)]
          md:pl-0
          ${isLeft ? 'md:mr-auto md:pr-6 md:text-right' : 'md:ml-auto md:pl-6'}
        `}
      >
        <button
          onClick={onToggle}
          className="w-full text-left group cursor-pointer"
          aria-expanded={isExpanded}
        >
          <div
            className={`
              glass-card shadow-sm transition-all duration-200
              hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring
              ${isMilestone ? 'p-5 sm:p-6 border-l-4 md:border-l-0' : 'p-3 sm:p-4'}
              ${isMilestone && isLeft ? 'md:border-r-4 md:border-l-0' : ''}
              ${isMilestone && !isLeft ? 'md:border-l-4' : ''}
            `}
            style={isMilestone ? { borderColor: config.color } : undefined}
          >
            {/* Meta row: category badge + date */}
            <div className={`flex items-center gap-2 mb-2 flex-wrap ${isLeft ? 'md:justify-end' : ''}`}>
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: config.color + '18', color: config.color }}
              >
                <span>{config.icon}</span>
                {t(`timeline.category.${entry.category}`)}
              </span>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
              {entry.tags && entry.tags.length > 0 && (
                <span className="hidden sm:inline-flex text-[10px] text-muted-foreground/60">
                  {entry.tags.slice(0, 2).map(tag => `#${tag}`).join(' ')}
                </span>
              )}
            </div>

            {/* AI instance badge for news */}
            {entry.aiInstance && (
              <div className={`flex items-center gap-1.5 mb-1.5 ${isLeft ? 'md:justify-end' : ''}`}>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: aiInstanceColors[entry.aiInstance] || '#94A3B8' }}
                >
                  {entry.aiInstance.charAt(0)}
                </span>
                <span className="text-xs text-muted-foreground">{entry.aiInstance}</span>
              </div>
            )}

            {/* Title */}
            <h3
              className={`font-semibold leading-snug mb-1.5 ${isMilestone ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}
            >
              {entry.title[lang]}
            </h3>

            {/* Summary — milestones show by default */}
            {(isMilestone || isExpanded) && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {entry.summary[lang]}
              </p>
            )}

            {/* Expand indicator */}
            <div className={`mt-2 text-xs text-muted-foreground/60 flex items-center gap-1 ${isLeft ? 'md:justify-end' : ''}`}>
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

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div
                className={`
                  mt-2 rounded-lg border border-border/30 bg-muted/30 p-4
                  text-sm leading-relaxed text-foreground/80
                  ${isLeft ? 'md:text-right' : ''}
                `}
              >
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
                {entry.newsId && (
                  <a
                    href={`/${locale}/news/${entry.newsId}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: config.color }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    📡 {t('timeline.viewNews')} →
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Connector line from node to card (mobile only — faint) */}
      <div className="absolute left-[7px] top-[30px] w-[25px] h-px bg-border/40 md:hidden" />
    </div>
  );
}

/* ─── month label on the center line ──────────────────────── */
function MonthLabel({ monthKey, locale }: { monthKey: string; locale: string }) {
  const d = new Date(monthKey + '-01');
  const m = d.getMonth();
  let label: string;
  if (locale === 'ja') label = `${m + 1}月`;
  else if (locale === 'zh') label = `${m + 1}月`;
  else label = d.toLocaleDateString('en-US', { month: 'short' });

  return (
    <div className="relative flex items-center justify-start md:justify-center py-1">
      <span className="ml-6 md:ml-0 text-xs font-medium text-muted-foreground/70 bg-background px-2 py-0.5 rounded-full border border-border/30 z-10 relative">
        {label}
      </span>
    </div>
  );
}

/* ─── year header ─────────────────────────────────────────── */
function YearHeader({ year }: { year: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="relative flex items-center justify-center py-6"
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <span className="relative bg-background px-6 py-2 text-2xl sm:text-3xl font-bold tracking-tight z-10"
        style={{
          background: 'linear-gradient(135deg, #5eead4, #22d3ee, #c084fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {year}
      </span>
    </motion.div>
  );
}

/* ─── filter bar ──────────────────────────────────────────── */
function FilterBar({
  categoryFilter,
  timeRange,
  onCategoryChange,
  onTimeRangeChange,
  t,
}: {
  categoryFilter: CategoryFilter;
  timeRange: TimeRangeFilter;
  onCategoryChange: (f: CategoryFilter) => void;
  onTimeRangeChange: (r: TimeRangeFilter) => void;
  t: (key: string) => string;
}) {
  const categories: { key: CategoryFilter; labelKey: string }[] = [
    { key: 'all', labelKey: 'timeline.filter.all' },
    { key: 'tech', labelKey: 'timeline.filter.tech' },
    { key: 'daily', labelKey: 'timeline.filter.daily' },
    { key: 'milestone', labelKey: 'timeline.filter.milestone' },
    { key: 'news', labelKey: 'timeline.filter.news' },
    { key: 'reflection', labelKey: 'timeline.filter.reflection' },
  ];

  const timeRanges: { key: TimeRangeFilter; labelKey: string }[] = [
    { key: 'all', labelKey: 'timeline.timeRange.all' },
    { key: 'week', labelKey: 'timeline.timeRange.week' },
    { key: 'month', labelKey: 'timeline.timeRange.month' },
    { key: 'year', labelKey: 'timeline.timeRange.year' },
  ];

  return (
    <div className="glass-card p-4 sm:p-5 mb-10 space-y-4">
      {/* Time range */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">⏱</span>
        {timeRanges.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => onTimeRangeChange(key)}
            className={`
              px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
              border cursor-pointer
              ${timeRange === key
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'}
            `}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Category */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">📂</span>
        {categories.map(({ key, labelKey }) => {
          const isActive = categoryFilter === key;
          const color = key === 'all' ? undefined : categoryConfig[key as TimelineCategory]?.color;
          return (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                border cursor-pointer
                ${isActive
                  ? 'text-white shadow-sm'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'}
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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*                     MAIN PAGE                              */
/* ═══════════════════════════════════════════════════════════ */
export default function TimelinePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* filter entries */
  const filteredEntries = useMemo(() => {
    return timelineData.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (!isInTimeRange(e.date, timeRange)) return false;
      return true;
    });
  }, [categoryFilter, timeRange]);

  const visibleEntries = useMemo(
    () => filteredEntries.slice(0, visibleCount),
    [filteredEntries, visibleCount]
  );

  const hasMore = visibleCount < filteredEntries.length;

  /* group visible entries by year → month */
  const grouped = useMemo(() => groupByYearMonth(visibleEntries), [visibleEntries]);

  const handleCategoryChange = useCallback((f: CategoryFilter) => {
    setCategoryFilter(f);
    setVisibleCount(INITIAL_COUNT);
    setExpandedId(null);
  }, []);

  const handleTimeRangeChange = useCallback((r: TimeRangeFilter) => {
    setTimeRange(r);
    setVisibleCount(INITIAL_COUNT);
    setExpandedId(null);
  }, []);

  /* running index across all visible entries for alternation */
  let runningIndex = 0;

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <ScrollReveal direction="fadeUp" className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            {t('timeline.title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('timeline.subtitle')}
          </p>
        </ScrollReveal>

        {/* Filter bar in glass-card */}
        <FilterBar
          categoryFilter={categoryFilter}
          timeRange={timeRange}
          onCategoryChange={handleCategoryChange}
          onTimeRangeChange={handleTimeRangeChange}
          t={t}
        />

        {/* Count */}
        <div className="text-center text-sm text-muted-foreground mb-8">
          {t('timeline.count', { count: filteredEntries.length })}
        </div>

        {/* Timeline container */}
        <div className="relative">
          {/* Center vertical line — brand gradient */}
          <div
            className="absolute left-[7px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 timeline-line-anim"
            style={{
              background: 'linear-gradient(180deg, #5eead4 0%, #22d3ee 50%, #c084fc 100%)',
            }}
          />

          {/* Grouped content */}
          {grouped.map((yearGroup) => (
            <div key={yearGroup.year}>
              {/* Year header */}
              <YearHeader year={yearGroup.year} />

              {yearGroup.months.map((monthGroup) => {
                return (
                  <div key={monthGroup.monthKey}>
                    {/* Month label */}
                    <MonthLabel monthKey={monthGroup.monthKey} locale={locale} />

                    {/* Entries in this month */}
                    <div className="flex flex-col gap-5 sm:gap-6 mb-4">
                      {monthGroup.entries.map((entry) => {
                        const idx = runningIndex++;
                        return (
                          <TimelineCard
                            key={entry.id}
                            entry={entry}
                            index={idx}
                            locale={locale}
                            isExpanded={expandedId === entry.id || (entry.isMilestone && expandedId === null && idx < 3)}
                            onToggle={() =>
                              setExpandedId(expandedId === entry.id ? null : entry.id)
                            }
                            t={t}
                            shouldPulse={idx < 3}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

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

        {/* Empty state */}
        {filteredEntries.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg mb-2">🔍</p>
            <p className="text-sm">No entries found for this filter.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
