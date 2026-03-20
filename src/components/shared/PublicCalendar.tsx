'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { calendarEvents, type CalendarEvent } from '@/data/calendar';

/* ── helpers ──────────────────────────────────────────── */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function toYMD(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

const categoryColors: Record<CalendarEvent['category'], string> = {
  blog: 'bg-brand-cyan',
  event: 'bg-brand-mint',
  milestone: 'bg-brand-taro',
  maintenance: 'bg-brand-coral',
};

const categoryLabels: Record<CalendarEvent['category'], string> = {
  blog: '📝 Blog',
  event: '🎤 Event',
  milestone: '🏆 Milestone',
  maintenance: '🔧 Maintenance',
};

/* ── component ────────────────────────────────────────── */

export function PublicCalendar({ compact = false }: { compact?: boolean }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  /* Build days grid */
  const { days, blanks } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return {
      blanks: firstDay,
      days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
    };
  }, [year, month]);

  /* Events index by date */
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of calendarEvents) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, []);

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];

  function prev() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  }

  function next() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  }

  const monthLabel = new Date(year, month).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
  });

  const todayStr = toYMD(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className={compact ? '' : 'glass-card p-5 sm:p-6'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prev}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Previous month"
        >
          ←
        </button>
        <h3 className="font-semibold text-sm sm:text-base">{monthLabel}</h3>
        <button
          onClick={next}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-[10px] sm:text-xs text-center text-muted-foreground font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading blanks */}
        {Array.from({ length: blanks }).map((_, i) => (
          <div key={`b-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = toYMD(year, month, day);
          const events = eventsByDate.get(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs sm:text-sm transition-all duration-200
                ${isToday ? 'font-bold ring-1 ring-brand-mint/50' : ''}
                ${isSelected ? 'bg-brand-mint/20 text-brand-mint' : 'hover:bg-foreground/5'}
                ${events ? 'cursor-pointer' : 'cursor-default text-muted-foreground/70'}
              `}
            >
              <span>{day}</span>
              {/* Event dots */}
              {events && (
                <div className="flex gap-0.5 mt-0.5">
                  {events.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${categoryColors[e.category]}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected event detail */}
      <AnimatePresence mode="wait">
        {selectedDate && selectedEvents.length > 0 && (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2 border-t border-border/30 pt-4">
              {selectedEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex gap-3 items-start p-2 rounded-lg bg-foreground/[0.02]"
                >
                  <span
                    className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${categoryColors[evt.category]}`}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-snug">{evt.title}</div>
                    {evt.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {evt.description}
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground/60 mt-1">
                      {categoryLabels[evt.category]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      {!compact && (
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border/20">
          {Object.entries(categoryLabels).map(([cat, label]) => (
            <div key={cat} className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
              <span
                className={`w-2 h-2 rounded-full ${categoryColors[cat as CalendarEvent['category']]}`}
              />
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
