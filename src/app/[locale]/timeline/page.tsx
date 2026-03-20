'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { timelineData, categoryConfig, type TimelineCategory, type TimelineEntry } from '@/data/timeline';
import { aiInstanceColors } from '@/data/news';

/* ─── types ──────────────────────────────────────────────── */
type CategoryFilter = 'all' | TimelineCategory;
type DrillView = 'year' | 'month' | 'day';
type SlideDirection = 'right' | 'left';

/* ─── helpers ────────────────────────────────────────────── */
function formatDate(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(d);
}

function getKeywords(entries: TimelineEntry[], lang: 'zh' | 'ja' | 'en', max = 3): string[] {
  const tagCounts: Record<string, number> = {};
  entries.forEach(e => {
    e.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([tag]) => tag);
}

function getMostImportantTitle(entries: TimelineEntry[], lang: 'zh' | 'ja' | 'en'): string {
  const milestone = entries.find(e => e.isMilestone);
  if (milestone) return milestone.title[lang];
  return entries[0]?.title[lang] || '';
}

/* ─── slide animation variants ───────────────────────────── */
const slideVariants = {
  enter: (dir: SlideDirection) => ({
    x: dir === 'right' ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: SlideDirection) => ({
    x: dir === 'right' ? -300 : 300,
    opacity: 0,
  }),
};

/* ─── node component (the dot/diamond on the center line) ── */
function TimelineNode({ entry, shouldPulse }: { entry: TimelineEntry; shouldPulse: boolean }) {
  const config = categoryConfig[entry.category];

  if (entry.category === 'news') {
    return (
      <div
        className="absolute left-0 md:left-1/2 top-6 z-10 -translate-x-1/2 md:-translate-x-1/2"
        style={{ left: 'var(--node-left)' }}
      >
        <div
          className={`w-3.5 h-3.5 rotate-45 border-2 border-background shadow-sm ${shouldPulse ? 'dot-pulse' : ''}`}
          style={{
            backgroundColor: '#FBBF24',
            '--pulse-color': '#FBBF2460',
          } as React.CSSProperties}
        />
      </div>
    );
  }

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

/* ─── single timeline card (for day view) ─────────────────── */
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
  const isLeft = index % 2 === 0;
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
      style={{ '--node-left': '7px' } as React.CSSProperties}
    >
      <TimelineNode entry={entry} shouldPulse={shouldPulse} />

      <motion.div
        initial={{ opacity: 0, y: 24, x: isLeft ? -30 : 30 }}
        animate={isVisible ? { opacity: 1, y: 0, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.04 * (index % 6), ease: 'easeOut' }}
        className={`
          w-full pl-8
          md:w-[calc(50%-1.5rem)] md:pl-0
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

            <h3 className={`font-semibold leading-snug mb-1.5 ${isMilestone ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
              {entry.title[lang]}
            </h3>

            {(isMilestone || isExpanded) && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {entry.summary[lang]}
              </p>
            )}

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

      <div className="absolute left-[7px] top-[30px] w-[25px] h-px bg-border/40 md:hidden" />
    </div>
  );
}

/* ─── filter bar ──────────────────────────────────────────── */
function FilterBar({
  categoryFilter,
  onCategoryChange,
  t,
}: {
  categoryFilter: CategoryFilter;
  onCategoryChange: (f: CategoryFilter) => void;
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

  return (
    <div className="glass-card p-4 sm:p-5 mb-10">
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

/* ─── back button ─────────────────────────────────────────── */
function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-6 group"
    >
      <motion.span
        className="inline-block"
        whileHover={{ x: -3 }}
        transition={{ duration: 0.2 }}
      >
        ←
      </motion.span>
      {label}
    </button>
  );
}

/* ─── year card ───────────────────────────────────────────── */
function YearCard({
  year,
  entries,
  locale,
  onClick,
  index,
}: {
  year: string;
  entries: TimelineEntry[];
  locale: string;
  onClick: () => void;
  index: number;
}) {
  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en' ? locale : 'en') as 'zh' | 'ja' | 'en';
  const milestones = entries.filter(e => e.isMilestone);
  const keywords = getKeywords(entries, lang);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
    >
      <button
        onClick={onClick}
        className="w-full text-left group cursor-pointer"
      >
        <div className="glass-card p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-[1.01]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Year number */}
              <h2
                className="text-4xl sm:text-5xl font-bold tracking-tight mb-3"
                style={{
                  background: 'linear-gradient(135deg, #5eead4, #22d3ee, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {year}
              </h2>

              {/* Stats row */}
              <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  📋 {entries.length} entries
                </span>
                {milestones.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    🏆 {milestones.length}
                  </span>
                )}
              </div>

              {/* Keyword tags */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map(kw => (
                    <span
                      key={kw}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Arrow */}
            <motion.span
              className="text-2xl text-muted-foreground/40 group-hover:text-foreground/60 transition-colors mt-2"
              whileHover={{ x: 4 }}
            >
              →
            </motion.span>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

/* ─── month card ──────────────────────────────────────────── */
function MonthCard({
  month,
  entries,
  locale,
  hasData,
  onClick,
  t,
}: {
  month: number;
  entries: TimelineEntry[];
  locale: string;
  hasData: boolean;
  onClick: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en' ? locale : 'en') as 'zh' | 'ja' | 'en';
  const monthName = t(`timeline.monthNames.${month}`);
  const topTitle = hasData ? getMostImportantTitle(entries, lang) : '';
  const milestones = entries.filter(e => e.isMilestone);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: (month - 1) * 0.04 }}
    >
      <button
        onClick={hasData ? onClick : undefined}
        disabled={!hasData}
        className={`
          w-full text-left group
          ${hasData ? 'cursor-pointer' : 'cursor-default'}
        `}
      >
        <div
          className={`
            glass-card p-4 sm:p-5 transition-all duration-200 h-full
            ${hasData
              ? 'shadow-sm hover:shadow-md group-hover:scale-[1.02]'
              : 'opacity-40'}
          `}
        >
          {/* Month name */}
          <h3
            className={`text-xl sm:text-2xl font-bold mb-2 ${hasData ? '' : 'text-muted-foreground/50'}`}
            style={hasData ? {
              background: 'linear-gradient(135deg, #5eead4, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            } : undefined}
          >
            {monthName}
          </h3>

          {hasData ? (
            <>
              {/* Event count + milestone indicator */}
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <span>{entries.length} entries</span>
                {milestones.length > 0 && (
                  <span className="text-yellow-500">🏆 {milestones.length}</span>
                )}
              </div>

              {/* Most important event title */}
              <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                {topTitle}
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground/40">
              {t('timeline.noEvents')}
            </p>
          )}
        </div>
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*                     MAIN PAGE                              */
/* ═══════════════════════════════════════════════════════════ */
export default function TimelinePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [view, setView] = useState<DrillView>('year');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>('right');

  /* filter entries by category */
  const filteredEntries = useMemo(() => {
    return timelineData.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      return true;
    });
  }, [categoryFilter]);

  /* group by year */
  const yearGroups = useMemo(() => {
    const groups: Record<string, TimelineEntry[]> = {};
    filteredEntries.forEach(e => {
      const year = e.date.slice(0, 4);
      if (!groups[year]) groups[year] = [];
      groups[year].push(e);
    });
    return groups;
  }, [filteredEntries]);

  /* sorted years descending */
  const sortedYears = useMemo(() => {
    return Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a));
  }, [yearGroups]);

  /* group by month for selected year */
  const monthGroups = useMemo(() => {
    if (!selectedYear || !yearGroups[selectedYear]) return {};
    const groups: Record<string, TimelineEntry[]> = {};
    yearGroups[selectedYear].forEach(e => {
      const month = String(new Date(e.date).getMonth() + 1);
      if (!groups[month]) groups[month] = [];
      groups[month].push(e);
    });
    return groups;
  }, [selectedYear, yearGroups]);

  /* entries for selected month */
  const dayEntries = useMemo(() => {
    if (!selectedYear || !selectedMonth) return [];
    return filteredEntries.filter(e => {
      const y = e.date.slice(0, 4);
      const m = String(new Date(e.date).getMonth() + 1);
      return y === selectedYear && m === selectedMonth;
    });
  }, [selectedYear, selectedMonth, filteredEntries]);

  /* navigation handlers */
  const drillToMonth = useCallback((year: string) => {
    setSlideDirection('right');
    setSelectedYear(year);
    setView('month');
    setExpandedId(null);
  }, []);

  const drillToDay = useCallback((month: string) => {
    setSlideDirection('right');
    setSelectedMonth(month);
    setView('day');
    setExpandedId(null);
  }, []);

  const backToYear = useCallback(() => {
    setSlideDirection('left');
    setView('year');
    setSelectedYear(null);
    setSelectedMonth(null);
    setExpandedId(null);
  }, []);

  const backToMonth = useCallback(() => {
    setSlideDirection('left');
    setView('month');
    setSelectedMonth(null);
    setExpandedId(null);
  }, []);

  const handleCategoryChange = useCallback((f: CategoryFilter) => {
    setCategoryFilter(f);
    setView('year');
    setSelectedYear(null);
    setSelectedMonth(null);
    setExpandedId(null);
  }, []);

  /* breadcrumb title */
  const viewTitle = useMemo(() => {
    if (view === 'month' && selectedYear) {
      return t('timeline.yearView', { year: selectedYear });
    }
    if (view === 'day' && selectedYear && selectedMonth) {
      const monthName = t(`timeline.monthNames.${selectedMonth}`);
      return t('timeline.monthView', { year: selectedYear, month: monthName });
    }
    return '';
  }, [view, selectedYear, selectedMonth, t]);

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

        {/* Filter bar */}
        <FilterBar
          categoryFilter={categoryFilter}
          onCategoryChange={handleCategoryChange}
          t={t}
        />

        {/* Count */}
        <div className="text-center text-sm text-muted-foreground mb-8">
          {t('timeline.count', { count: filteredEntries.length })}
        </div>

        {/* Drill-down content */}
        <AnimatePresence mode="wait" custom={slideDirection}>
          {/* ─── YEAR VIEW ─── */}
          {view === 'year' && (
            <motion.div
              key="year-view"
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex flex-col gap-4 sm:gap-5"
            >
              {sortedYears.map((year, idx) => (
                <YearCard
                  key={year}
                  year={year}
                  entries={yearGroups[year]}
                  locale={locale}
                  onClick={() => drillToMonth(year)}
                  index={idx}
                />
              ))}

              {sortedYears.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="text-lg mb-2">🔍</p>
                  <p className="text-sm">No entries found for this filter.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── MONTH VIEW ─── */}
          {view === 'month' && selectedYear && (
            <motion.div
              key={`month-view-${selectedYear}`}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <BackButton onClick={backToYear} label={t('timeline.back')} />

              <h2
                className="text-2xl sm:text-3xl font-bold mb-8"
                style={{
                  background: 'linear-gradient(135deg, #5eead4, #22d3ee, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {viewTitle}
              </h2>

              {/* 12 months grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                  const mStr = String(month);
                  const monthEntries = monthGroups[mStr] || [];
                  const hasData = monthEntries.length > 0;
                  return (
                    <MonthCard
                      key={month}
                      month={month}
                      entries={monthEntries}
                      locale={locale}
                      hasData={hasData}
                      onClick={() => drillToDay(mStr)}
                      t={t}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─── DAY VIEW ─── */}
          {view === 'day' && selectedYear && selectedMonth && (
            <motion.div
              key={`day-view-${selectedYear}-${selectedMonth}`}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <BackButton onClick={backToMonth} label={t('timeline.back')} />

              <h2
                className="text-2xl sm:text-3xl font-bold mb-8"
                style={{
                  background: 'linear-gradient(135deg, #5eead4, #22d3ee, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {viewTitle}
              </h2>

              {/* Classic vertical timeline */}
              <div className="relative">
                {/* Center vertical line */}
                <div
                  className="absolute left-[7px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 timeline-line-anim"
                  style={{
                    background: 'linear-gradient(180deg, #5eead4 0%, #22d3ee 50%, #c084fc 100%)',
                  }}
                />

                {/* Entries */}
                <div className="flex flex-col gap-5 sm:gap-6">
                  {dayEntries.map((entry, idx) => (
                    <TimelineCard
                      key={entry.id}
                      entry={entry}
                      index={idx}
                      locale={locale}
                      isExpanded={expandedId === entry.id || (entry.isMilestone && expandedId === null && idx < 3)}
                      onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      t={t}
                      shouldPulse={idx < 3}
                    />
                  ))}
                </div>

                {/* End dot */}
                <div className="absolute left-[3px] md:left-1/2 md:-translate-x-1/2 bottom-0 w-3 h-3 rounded-full bg-border" />
              </div>

              {dayEntries.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="text-lg mb-2">🔍</p>
                  <p className="text-sm">{t('timeline.noEvents')}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
