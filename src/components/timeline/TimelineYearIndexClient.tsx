'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { timelineEvents, type TimelineEvent } from '@/lib/timeline-data';
import { useReducedMotion } from 'framer-motion';

type TimelineCategory = TimelineEvent['category'];
type CategoryFilter = 'all' | TimelineCategory;

const categoryConfig: Record<TimelineCategory, { color: string; icon: string }> = {
  cattery: { color: '#f59e0b', icon: '🐾' },
  tech: { color: '#22d3ee', icon: '🔧' },
  ai: { color: '#8b5cf6', icon: '🤖' },
  life: { color: '#fb7185', icon: '🌸' },
};

function getKeywords(entries: TimelineEvent[], max = 3): string[] {
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

// Animated timeline node component
function TimelineNode({ 
  year, 
  entries, 
  index,
  totalYears,
  isFiltered 
}: { 
  year: string; 
  entries: TimelineEvent[]; 
  index: number;
  totalYears: number;
  isFiltered: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const monthCount = new Set(entries.map((entry) => entry.date.slice(5, 7))).size;
  const keywords = getKeywords(entries);
  const eventCount = entries.length;
  
  // Calculate line gradient based on position
  const progress = totalYears > 1 ? index / (totalYears - 1) : 0.5;
  const gradientColors = [
    { r: 94, g: 234, b: 212 }, // mint
    { r: 34, g: 211, b: 238 }, // cyan
    { r: 192, g: 132, b: 246 }, // purple
    { r: 251, g: 146, b: 60 }, // orange
  ];
  const idx = Math.floor(progress * (gradientColors.length - 1));
  const color = gradientColors[idx];
  const lineColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="relative"
    >
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-px" style={{
        background: `linear-gradient(to bottom, ${lineColor}, ${lineColor}40)`,
      }} />
      
      {/* Timeline node */}
      <div className="relative flex items-start gap-4 sm:gap-6">
        {/* Animated node */}
        <motion.div 
          className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-4 flex items-center justify-center"
          style={{ 
            borderColor: lineColor,
            backgroundColor: 'var(--background)',
            boxShadow: `0 0 20px ${lineColor}40`
          }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <span className="text-xl">{entries[0]?.category ? categoryConfig[entries[0].category]?.icon : '📅'}</span>
        </motion.div>
        
        {/* Content card */}
        <Link href={`/timeline/${year}` as `/${string}`} className="flex-1 group">
          <motion.div 
            className="glass-card p-5 sm:p-6 cursor-pointer"
            whileHover={prefersReducedMotion ? {} : { 
              x: 8,
              boxShadow: `0 0 30px ${lineColor}30`
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Year with animated gradient */}
                <motion.h2 
                  className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${lineColor}, ${lineColor}cc)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {year}
                </motion.h2>

                <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-muted-foreground">
                  <motion.span 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50"
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lineColor }} />
                    📋 {eventCount} {isFiltered ? 'events' : 'events'}
                  </motion.span>
                  <motion.span 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50"
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  >
                    🗓 {monthCount} {isFiltered ? 'months' : 'months'}
                  </motion.span>
                  
                  {/* Category badges */}
                  {[...new Set(entries.map(e => e.category))].slice(0, 3).map(cat => (
                    <motion.span 
                      key={cat}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                      style={{ 
                        backgroundColor: `${categoryConfig[cat].color}20`,
                        color: categoryConfig[cat].color
                      }}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                    >
                      {categoryConfig[cat].icon} {cat}
                    </motion.span>
                  ))}
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

              {/* Animated arrow */}
              <motion.div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${lineColor}20` }}
                whileHover={prefersReducedMotion ? {} : { x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-xl" style={{ color: lineColor }}>→</span>
              </motion.div>
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

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
        className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span>📊 {filteredEntries.length} events</span>
        <span className="w-px h-4 bg-border" />
        <span>📅 {yearGroups.length} years</span>
        <span className="w-px h-4 bg-border" />
        <span>🏷 {[...new Set(filteredEntries.map(e => e.category))].length} categories</span>
      </motion.div>

      {/* Timeline */}
      <div className="relative pl-6 sm:pl-12">
        <AnimatePresence mode="popLayout">
          {yearGroups.length > 0 ? (
            yearGroups.map(([year, entries], index) => (
              <TimelineNode 
                key={year} 
                year={year} 
                entries={entries} 
                index={index}
                totalYears={yearGroups.length}
                isFiltered={categoryFilter !== 'all'}
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-muted-foreground">{t('noEvents')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
