'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import type { DebateLocale, DebateOpinionRecord, DebateStance } from '@/lib/debate-store';

const stanceColors: Record<DebateStance, string> = {
  pro: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  con: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  neutral: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
};

const stanceIcons: Record<DebateStance, string> = {
  pro: '✅',
  con: '❌',
  neutral: '🤔',
};

function pickOpinionText(opinion: DebateOpinionRecord['opinion'], locale: DebateLocale): string {
  return opinion[locale] || opinion.zh || opinion.ja || opinion.en || '';
}

export function DynamicDebateOpinions({
  topicId,
  locale,
}: {
  topicId: string;
  locale: DebateLocale;
}) {
  const t = useTranslations('debate');
  const [opinions, setOpinions] = useState<DebateOpinionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOpinions() {
      try {
        const response = await fetch(`/api/debate/opinion/${topicId}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to load debate opinions');
        }

        const data = (await response.json()) as { opinions?: DebateOpinionRecord[] };
        if (!cancelled) {
          setOpinions(data.opinions ?? []);
          setFailed(false);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOpinions();

    return () => {
      cancelled = true;
    };
  }, [topicId]);

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">{t('live_opinions')}</h2>
        <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
          {t('live_badge')}
        </span>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">{t('live_loading')}</p> : null}
      {!loading && failed ? <p className="text-sm text-muted-foreground">{t('live_error')}</p> : null}
      {!loading && !failed && opinions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('live_empty')}</p>
      ) : null}

      <div className="flex flex-col gap-5 mt-4">
        {opinions.map((opinion, index) => (
          <motion.div
            key={opinion.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
          >
            <div className="glass-card p-5 sm:p-6 border-sky-500/20">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  <span className="w-2 h-2 rounded-full bg-sky-300" />
                  {opinion.model}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stanceColors[opinion.stance]}`}>
                  {stanceIcons[opinion.stance]} {t(opinion.stance)}
                </span>
              </div>

              <p className="text-base leading-relaxed">{pickOpinionText(opinion.opinion, locale)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
