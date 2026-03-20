'use client';

import { motion } from 'motion/react';
import { type TimelineEntry, categoryConfig } from '@/data/timeline';
import { Link } from '@/i18n/navigation';

export function TimelinePageClient({
  events,
  locale,
}: {
  events: TimelineEntry[];
  locale: 'zh' | 'ja' | 'en';
}) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border/40" />

      <div className="flex flex-col gap-8">
        {events.map((entry, i) => {
          const cat = categoryConfig[entry.category];
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="relative flex w-full md:items-center"
            >
              {/* Card */}
              <div
                className={`w-full md:w-[calc(50%-2.5rem)] pl-12 md:pl-0 ${
                  isLeft ? 'md:mr-auto md:pr-6' : 'md:ml-auto md:pl-6'
                }`}
              >
                <div className="glass-card p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${cat.color}20`, color: cat.color }}
                    >
                      {cat.icon} {entry.category}
                    </span>
                    {entry.isMilestone && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-coral/15 text-brand-coral">
                        ⭐
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{entry.title[locale]}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {entry.summary[locale]}
                  </p>
                  {entry.link && (
                    <Link
                      href={entry.link as `/${string}`}
                      className="mt-2 inline-block text-xs text-brand-mint hover:underline"
                    >
                      →
                    </Link>
                  )}
                </div>
              </div>

              {/* Dot */}
              <div
                className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-5 w-8 h-8 rounded-full flex items-center justify-center text-base z-10"
                style={{ background: `${cat.color}20`, border: `2px solid ${cat.color}50` }}
              >
                {cat.icon}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
