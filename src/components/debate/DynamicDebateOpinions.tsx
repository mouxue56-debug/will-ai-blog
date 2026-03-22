'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MessageSquare, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import type { DebateLocale, DebateOpinionRecord, DebateStance } from '@/lib/debate-store';

// ── Constants ────────────────────────────────────────────────────────────────

const MODEL_COLORS: Record<string, string> = {
  'ユキ': '#38bdf8',
  'ナツ': '#fb923c',
  'ハル': '#a78bfa',
  'claude': '#c084fc',
  'gpt': '#4ade80',
  'gemini': '#38bdf8',
  'deepseek': '#fb923c',
  'kimi': '#5eead4',
  'qwen': '#f472b6',
};

function getModelColor(model: string, instanceName?: string): string {
  if (instanceName && MODEL_COLORS[instanceName]) return MODEL_COLORS[instanceName];
  const lower = model.toLowerCase();
  for (const [key, color] of Object.entries(MODEL_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#94a3b8';
}

const stanceColors: Record<DebateStance, string> = {
  pro: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  con: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  neutral: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
};

function pickText(opinion: DebateOpinionRecord['opinion'], locale: DebateLocale): string {
  return opinion[locale] || opinion.zh || opinion.ja || opinion.en || '';
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '…';
}

// ── Component ────────────────────────────────────────────────────────────────

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
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOpinions() {
      try {
        const response = await fetch(`/api/debate/opinion/${topicId}`, {
          cache: 'no-store',
        });

        if (!response.ok) throw new Error('Failed');

        const data = (await response.json()) as { opinions?: DebateOpinionRecord[] };
        if (!cancelled) {
          setOpinions(data.opinions ?? []);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOpinions();
    return () => { cancelled = true; };
  }, [topicId]);

  // Show up to 3 preview opinions
  const preview = opinions.slice(0, 3);
  const count = opinions.length;

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{t('live_opinions')}</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
            {t('live_badge')}
          </span>
          {!loading && !failed && count > 0 && (
            <span className="text-xs text-muted-foreground ml-1">
              ({count})
            </span>
          )}
        </div>

        {!loading && !failed && count > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-mint transition-colors cursor-pointer"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                展开 {count} 条
              </>
            )}
          </button>
        )}
      </div>

      {/* Loading / Error / Empty */}
      {loading && (
        <p className="text-sm text-muted-foreground">{t('live_loading')}</p>
      )}
      {!loading && failed && (
        <p className="text-sm text-muted-foreground">{t('live_error')}</p>
      )}
      {!loading && !failed && count === 0 && (
        <p className="text-sm text-muted-foreground">{t('live_empty')}</p>
      )}

      {/* Preview — always shown when there are opinions */}
      {!loading && !failed && count > 0 && (
        <div className="flex flex-col gap-3">
          {preview.map((opinion, index) => {
            const color = getModelColor(opinion.model, (opinion as DebateOpinionRecord & { instanceName?: string }).instanceName);
            const text = pickText(opinion.opinion, locale);
            if (!text) return null;

            return (
              <motion.div
                key={opinion.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass-card overflow-hidden"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="px-4 pt-3 pb-2 flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
                  >
                    <Bot className="w-3 h-3" />
                    {opinion.model}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stanceColors[opinion.stance]}`}>
                    {t(opinion.stance)}
                  </span>
                </div>
                <p className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">
                  {truncate(text, 80)}
                </p>
              </motion.div>
            );
          })}

          {/* Expanded full list */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 pt-1">
                  {opinions.slice(3).map((opinion, index) => {
                    const color = getModelColor(opinion.model, (opinion as DebateOpinionRecord & { instanceName?: string }).instanceName);
                    const text = pickText(opinion.opinion, locale);
                    if (!text) return null;

                    return (
                      <motion.div
                        key={opinion.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                        className="glass-card overflow-hidden"
                        style={{ borderLeft: `3px solid ${color}` }}
                      >
                        <div className="px-4 pt-3 pb-2 flex items-center gap-2 flex-wrap">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
                          >
                            <Bot className="w-3 h-3" />
                            {opinion.model}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stanceColors[opinion.stance]}`}>
                            {t(opinion.stance)}
                          </span>
                        </div>
                        <p className="px-4 pb-3 text-sm leading-relaxed">{text}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Link to detail page */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {count} 条观点
            </span>
            <Link
              href={`/${locale}/debate/${topicId}`}
              className="inline-flex items-center gap-1 text-xs text-brand-mint hover:underline transition-colors"
            >
              查看完整讨论 →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
