'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type DebatePost } from '@/data/debates';
import { PageTransition } from '@/components/shared/PageTransition';
import { Bot, MessageSquare } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type Locale = 'zh' | 'ja' | 'en';

interface DynamicOpinionSummary {
  count: number;
  latestText: string;
  models: Array<{ model: string; color: string }>;
}

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

const stanceColors = {
  pro: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  con: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  neutral: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
};

const stanceLabel = {
  zh: { pro: '赞成', con: '反对', neutral: '中立' },
  ja: { pro: '賛成', con: '反対', neutral: '中立' },
  en: { pro: 'Pro', con: 'Con', neutral: 'Neutral' },
};



// ── Dynamic opinions hook ─────────────────────────────────────────────────────

function useDebateOpinionSummary(
  topicId: string,
  locale: Locale,
): DynamicOpinionSummary | null {
  const [summary, setSummary] = useState<DynamicOpinionSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/debate/opinion/${topicId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { opinions?: Array<{ model: string; instanceName?: string; opinion?: Record<string, string> }> }) => {
        if (cancelled || !Array.isArray(data.opinions) || data.opinions.length === 0) return;

        const opinions = data.opinions;
        const latestOp = opinions[opinions.length - 1];
        const latestText =
          latestOp?.opinion?.[locale] ||
          latestOp?.opinion?.['zh'] ||
          latestOp?.opinion?.['ja'] ||
          latestOp?.opinion?.['en'] ||
          '';

        // Unique models with colors
        const seen = new Set<string>();
        const models: Array<{ model: string; color: string }> = [];
        for (const op of opinions) {
          if (!seen.has(op.model)) {
            seen.add(op.model);
            models.push({
              model: op.model,
              color: getModelColor(op.model, op.instanceName),
            });
          }
        }

        if (!cancelled) {
          setSummary({
            count: opinions.length,
            latestText: latestText.slice(0, 40) + (latestText.length > 40 ? '…' : ''),
            models: models.slice(0, 5), // cap at 5 avatars
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [topicId, locale]);

  return summary;
}

// ── Debate card with dynamic data ─────────────────────────────────────────────

function DebateCard({
  debate,
  locale,
}: {
  debate: DebatePost;
  locale: Locale;
}) {
  const t = useTranslations('debate');
  const dynamic = useDebateOpinionSummary(debate.id, locale);

  return (
    <Link href={`/${locale}/debate/${debate.id}`}>
      <div className="glass-card group cursor-pointer p-5 transition-all duration-200 hover:border-brand-mint/40 sm:p-6">
        {/* Row 1: date + session + join cta */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">{debate.date}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              debate.session === 'morning'
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-indigo-500/15 text-indigo-400'
            }`}
          >
            {debate.session === 'morning' ? t('session_morning') : t('session_evening')}
          </span>
          <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
            {dynamic ? (
              <>
                <MessageSquare className="w-3 h-3" />
                {dynamic.count} {t('dynamic_opinions')}
              </>
            ) : (
              <>
                {debate.aiOpinions.length} {t('opinions_count')}
              </>
            )}
            {' · '}
            {t('join')}
          </span>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-lg font-semibold transition-colors group-hover:text-brand-mint sm:text-xl">
          🥊 {debate.topic[locale]}
        </h2>

        {/* News source */}
        <p className="mb-3 text-xs italic text-muted-foreground">
          📰 {t('source')}{debate.newsSource}
        </p>

        {/* AI avatars — prefer dynamic, fall back to static */}
        {dynamic && dynamic.models.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {dynamic.models.map(({ model, color }) => (
              <span
                key={model}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
              >
                <Bot className="w-2.5 h-2.5" />
                {model}
              </span>
            ))}
          </div>
        ) : (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {debate.aiOpinions.map((op) => (
              <span
                key={op.model}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  background: `${op.modelColor}20`,
                  color: op.modelColor,
                  border: `1px solid ${op.modelColor}40`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: op.modelColor }} />
                {op.model}
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${stanceColors[op.stance]}`}>
                  {stanceLabel[locale][op.stance]}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Latest opinion snippet */}
        {dynamic?.latestText && (
          <p className="mb-3 text-xs text-muted-foreground border-l-2 border-white/10 pl-2 italic">
            {t('latest')}{dynamic.latestText}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {debate.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function DebatePageClient({
  debates,
  locale,
}: {
  debates: DebatePost[];
  locale: Locale;
}) {
  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Topic list */}
        {debates.length > 0 && (
          <div className="flex flex-col gap-6">
            {debates.map((debate, i) => (
              <motion.div
                key={debate.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <DebateCard debate={debate} locale={locale} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
