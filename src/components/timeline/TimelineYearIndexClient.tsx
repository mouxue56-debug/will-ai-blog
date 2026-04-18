'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { timelineEvents, type TimelineEvent } from '@/lib/timeline-data';
import { useReducedMotion } from 'framer-motion';

type TimelineCategory = TimelineEvent['category'];
type CategoryFilter = 'all' | TimelineCategory;

const categoryConfig: Record<TimelineCategory, { color: string; glow: string; icon: string }> = {
  cattery: { color: '#f59e0b', glow: 'rgba(245,158,11,0.35)', icon: '🐾' },
  tech:    { color: '#22d3ee', glow: 'rgba(34,211,238,0.35)',  icon: '🔧' },
  ai:      { color: '#c084fc', glow: 'rgba(192,132,246,0.35)', icon: '🤖' },
  life:    { color: '#fb7185', glow: 'rgba(251,113,133,0.35)', icon: '🌸' },
};

// Gradient palette per year index (mint → cyan → purple → coral)
const yearGradients = [
  'linear-gradient(135deg, #5eead4, #22d3ee)',
  'linear-gradient(135deg, #22d3ee, #818cf8)',
  'linear-gradient(135deg, #818cf8, #c084fc)',
  'linear-gradient(135deg, #c084fc, #fb7185)',
  'linear-gradient(135deg, #fb7185, #f59e0b)',
];

const yearGlowColors = [
  'rgba(94,234,212,0.25)',
  'rgba(34,211,238,0.25)',
  'rgba(129,140,248,0.25)',
  'rgba(192,132,246,0.25)',
  'rgba(251,113,133,0.25)',
];

/* ── Filter Bar ─────────────────────────────────────── */

function FilterBar({
  value,
  onChange,
}: {
  value: CategoryFilter;
  onChange: (next: CategoryFilter) => void;
}) {
  const t = useTranslations('timeline');
  const categories: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: t('filter.all') },
    { key: 'cattery', label: t('filter.cattery') },
    { key: 'tech', label: t('filter.tech') },
    { key: 'ai', label: t('filter.ai') },
    { key: 'life', label: t('filter.life') },
  ];

  return (
    <div className="glass-card p-4 sm:p-5 mb-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">📂</span>
        {categories.map(({ key, label }) => {
          const isActive = value === key;
          const color = key === 'all' ? undefined : categoryConfig[key].color;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer',
                isActive
                  ? 'text-white shadow-sm'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
              ].join(' ')}
              style={
                isActive
                  ? {
                      backgroundColor: color || 'var(--color-foreground)',
                      borderColor: color || 'var(--color-foreground)',
                      boxShadow: color ? `0 0 12px ${color}40` : undefined,
                    }
                  : undefined
              }
            >
              {key !== 'all' && <span className="mr-1">{categoryConfig[key].icon}</span>}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Single Year Card ──────────────────────────────── */

function YearCard({
  year,
  entries,
  index,
  totalYears: _totalYears,
}: {
  year: string;
  entries: TimelineEvent[];
  index: number;
  totalYears: number;
}) {
  const locale = useLocale() as 'zh' | 'ja' | 'en';
  const t = useTranslations('timeline');
  const prefersReducedMotion = useReducedMotion();

  const gradientIdx = Math.min(index, yearGradients.length - 1);
  const gradient = yearGradients[gradientIdx];
  const glow = yearGlowColors[gradientIdx];

  const topEvents = entries.slice(0, 3);
  const uniqueCategories = [...new Set(entries.map((e) => e.category))];

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <Link href={`/timeline/${year}` as `/${string}`} className="block">
        <motion.div
          className="glass-card relative overflow-hidden p-6 sm:p-8 cursor-pointer transition-colors duration-300"
          whileHover={
            prefersReducedMotion
              ? {}
              : {
                  y: -4,
                  transition: { duration: 0.25, ease: 'easeOut' },
                }
          }
        >
          {/* Background glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, ${glow}, transparent 70%)`,
            }}
          />

          {/* Top border accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px opacity-60"
            style={{ background: gradient }}
          />

          <div className="relative z-10">
            {/* Year + stats row */}
            <div className="flex items-start justify-between gap-4 mb-5">
              {/* BIG YEAR NUMBER */}
              <div className="relative">
                <h2
                  className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none select-none bg-clip-text text-transparent"
                  style={{
                    backgroundImage: gradient,
                    filter: 'drop-shadow(0 0 20px rgba(94,234,212,0.15))',
                  }}
                >
                  {year}
                </h2>
                {/* Glow behind year text */}
                <div
                  className="absolute -inset-2 -z-10 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                  style={{ background: gradient }}
                />
              </div>

              {/* Stats pills */}
              <div className="flex flex-col items-end gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground">
                  📋 {entries.length} {t('events_count')}
                </span>
                <div className="flex gap-1.5">
                  {uniqueCategories.slice(0, 3).map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{
                        backgroundColor: `${categoryConfig[cat].color}18`,
                        color: categoryConfig[cat].color,
                      }}
                    >
                      {categoryConfig[cat].icon}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Event previews */}
            <div className="space-y-3">
              {topEvents.map((event) => (
                <motion.div
                  key={event.date}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 group-hover:border-border/60 transition-colors duration-300"
                  whileHover={
                    prefersReducedMotion
                      ? {}
                      : { x: 4, transition: { duration: 0.2 } }
                  }
                >
                  {/* Month badge */}
                  <span
                    className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg text-xs font-bold text-white/90"
                    style={{
                      background: `${categoryConfig[event.category].color}30`,
                      color: categoryConfig[event.category].color,
                      border: `1px solid ${categoryConfig[event.category].color}40`,
                    }}
                  >
                    {t(`monthNames.${parseInt(event.date.slice(5, 7))}`)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate leading-snug">
                      {event.title[locale]}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {event.description[locale]}
                    </p>
                  </div>

                  {/* Category dot */}
                  <div
                    className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                    style={{
                      backgroundColor: categoryConfig[event.category].color,
                      boxShadow: `0 0 6px ${categoryConfig[event.category].glow}`,
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Bottom: "View all" hint */}
            {entries.length > 3 && (
              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                <span>+{entries.length - 3} more</span>
                <motion.span
                  className="inline-block"
                  whileHover={prefersReducedMotion ? {} : { x: 2 }}
                >
                  →
                </motion.span>
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ── Connecting line between cards ─────────────────── */

function Connector({ index }: { index: number }) {
  const gradientIdx = Math.min(index, yearGradients.length - 1);
  const nextIdx = Math.min(index + 1, yearGradients.length - 1);
  const from = yearGlowColors[gradientIdx];
  const to = yearGlowColors[nextIdx];

  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center gap-0.5">
        {/* Vertical line */}
        <div
          className="w-px h-8 sm:h-12"
          style={{
            background: `linear-gradient(to bottom, ${from}, ${to})`,
          }}
        />
        {/* Diamond node */}
        <div
          className="w-2.5 h-2.5 rotate-45 rounded-sm"
          style={{
            background: `linear-gradient(135deg, ${from}, ${to})`,
            boxShadow: `0 0 8px ${from}`,
          }}
        />
        {/* Vertical line */}
        <div
          className="w-px h-8 sm:h-12"
          style={{
            background: `linear-gradient(to bottom, ${to}, ${from})`,
          }}
        />
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────── */

export function TimelineYearIndexClient() {
  const t = useTranslations('timeline');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const prefersReducedMotion = useReducedMotion();

  const filteredEntries = useMemo(() => {
    if (categoryFilter === 'all') return timelineEvents;
    return timelineEvents.filter((entry) => entry.category === categoryFilter);
  }, [categoryFilter]);

  const yearGroups = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    filteredEntries.forEach((entry) => {
      const year = entry.date.slice(0, 4);
      if (!groups[year]) groups[year] = [];
      groups[year].push(entry);
    });
    return Object.entries(groups)
      .map(([year, entries]) => [year, [...entries].sort((a, b) => b.date.localeCompare(a.date))] as const)
      .sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filteredEntries]);

  return (
    <>
      <FilterBar value={categoryFilter} onChange={setCategoryFilter} />

      {/* Stats bar */}
      <motion.div
        className="flex items-center justify-center gap-4 sm:gap-6 mb-10 text-sm text-muted-foreground"
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40">
          📊 {filteredEntries.length} {t('events_count')}
        </span>
        <span className="w-px h-4 bg-border" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40">
          📅 {yearGroups.length} years
        </span>
        <span className="w-px h-4 bg-border" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40">
          🏷 {[...new Set(filteredEntries.map((e) => e.category))].length} categories
        </span>
      </motion.div>

      {/* Year cards with connectors */}
      <AnimatePresence mode="popLayout">
        {yearGroups.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-0">
            {yearGroups.map(([year, entries], index) => (
              <motion.div
                key={year}
                layout
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <YearCard
                  year={year}
                  entries={entries}
                  index={index}
                  totalYears={yearGroups.length}
                />
                {index < yearGroups.length - 1 && <Connector index={index} />}
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-muted-foreground">{t('noEvents')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
