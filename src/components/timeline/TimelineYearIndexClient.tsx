'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { timelineData, categoryConfig, type TimelineCategory, type TimelineEntry } from '@/data/timeline';

type CategoryFilter = 'all' | TimelineCategory;

function getKeywords(entries: TimelineEntry[], max = 3): string[] {
  const tagCounts: Record<string, number> = {};

  entries.forEach((entry) => {
    entry.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([tag]) => tag);
}

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
    { key: 'tech', label: t('filter.tech') },
    { key: 'daily', label: t('filter.daily') },
    { key: 'milestone', label: t('filter.milestone') },
    { key: 'news', label: t('filter.news') },
    { key: 'reflection', label: t('filter.reflection') },
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
                'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer',
                isActive
                  ? 'text-white shadow-sm'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
              ].join(' ')}
              style={isActive ? {
                backgroundColor: color || 'var(--color-foreground)',
                borderColor: color || 'var(--color-foreground)',
              } : undefined}
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

export function TimelineYearIndexClient() {
  const t = useTranslations('timeline');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const filteredEntries = useMemo(() => {
    return timelineData.filter((entry) => {
      if (categoryFilter !== 'all' && entry.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [categoryFilter]);

  const yearGroups = useMemo(() => {
    const groups: Record<string, TimelineEntry[]> = {};

    filteredEntries.forEach((entry) => {
      const year = entry.date.slice(0, 4);
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(entry);
    });

    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filteredEntries]);

  return (
    <>
      <FilterBar value={categoryFilter} onChange={setCategoryFilter} />

      <div className="text-center text-sm text-muted-foreground mb-8">
        {t('count', { count: filteredEntries.length })}
      </div>

      <div className="flex flex-col gap-4 sm:gap-5">
        {yearGroups.map(([year, entries], index) => {
          const milestoneCount = entries.filter((entry) => entry.isMilestone).length;
          const monthCount = new Set(entries.map((entry) => entry.date.slice(5, 7))).size;
          const keywords = getKeywords(entries);

          return (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
            >
              <Link href={`/timeline/${year}` as `/${string}`} className="block group">
                <div className="glass-card p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-[1.01]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
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

                      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">📋 {entries.length} {t('events_count')}</span>
                        <span className="inline-flex items-center gap-1">🗓 {monthCount} {t('months_count')}</span>
                        {milestoneCount > 0 && (
                          <span className="inline-flex items-center gap-1">🏆 {milestoneCount}</span>
                        )}
                      </div>

                      {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground"
                            >
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <motion.span
                      className="text-2xl text-muted-foreground/40 group-hover:text-foreground/60 transition-colors mt-2"
                      whileHover={{ x: 4 }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {yearGroups.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg mb-2">🔍</p>
            <p className="text-sm">{t('noEvents')}</p>
          </div>
        )}
      </div>
    </>
  );
}
