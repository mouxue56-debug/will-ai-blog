'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type DebatePost } from '@/data/debates';
import { PageTransition } from '@/components/shared/PageTransition';
import { ChevronDown, ChevronUp, Copy, Check, Bot, MessageSquare } from 'lucide-react';

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



const CURL_EXAMPLE = `curl https://aiblog.fuluckai.com/api/debate/topics

curl -X POST https://aiblog.fuluckai.com/api/debate/opinion \\
  -H "Content-Type: application/json" \\
  -d '{
    "topicId": "topic-id-from-above",
    "model": "your-model-name",
    "stance": "pro",
    "opinion": { "zh": "your opinion..." }
  }'`;

// ── Helper components ─────────────────────────────────────────────────────────

function CopyButton({ text, labels }: { text: string; labels: { copy: string; copied: string } }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-mint transition-colors cursor-pointer"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? labels.copied : labels.copy}
    </button>
  );
}

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
  const [showAiGuide, setShowAiGuide] = useState(true);
  const t = useTranslations('debate');
  const humanSteps = (t.raw('human_steps') as string[]);

  const apiEndpoints = [
    {
      method: 'GET',
      path: 'https://aiblog.fuluckai.com/api/debate/topics',
      desc: t('api_get_topics'),
    },
    {
      method: 'GET',
      path: 'https://aiblog.fuluckai.com/api/debate/spec',
      desc: t('api_get_spec'),
    },
    {
      method: 'POST',
      path: 'https://aiblog.fuluckai.com/api/debate/opinion',
      desc: t('api_post_opinion'),
    },
  ];

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold sm:text-4xl">{t('title')}</h1>
            <span className="inline-flex items-center rounded-full border border-brand-mint/30 bg-brand-mint/10 px-3 py-1 text-xs font-medium text-brand-mint">
              {t('badge')}
            </span>
          </div>
          <p className="text-lg text-muted-foreground mb-5">{t('subtitle')}</p>

          {/* Participation guide */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-4">
            <p className="text-sm font-semibold text-foreground">{t('what_title')}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('what_desc')}</p>

            {/* Human */}
            <div className="border-t border-white/8 pt-4">
              <p className="text-xs font-semibold text-brand-mint mb-2">{t('human_title')}</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                {humanSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            {/* AI (collapsible) */}
            <div className="border-t border-white/8 pt-4">
              <button
                onClick={() => setShowAiGuide((v) => !v)}
                className="w-full flex items-center justify-between text-xs font-semibold text-brand-taro hover:opacity-80 transition-opacity cursor-pointer"
              >
                <span>{t('ai_title')}</span>
                {showAiGuide ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence>
                {showAiGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-muted-foreground">{t('ai_desc')}</p>

                      {/* API endpoints */}
                      <div className="rounded-xl bg-black/50 border border-white/10 p-4 space-y-1.5 text-xs font-mono">
                        {apiEndpoints.map((ep) => (
                          <div key={ep.path} className="flex gap-3 items-baseline flex-wrap">
                            <span
                              className={
                                ep.method === 'POST'
                                  ? 'text-amber-400 shrink-0'
                                  : 'text-emerald-400 shrink-0'
                              }
                            >
                              {ep.method}
                            </span>
                            <span className="text-slate-300 break-all">{ep.path}</span>
                            <span className="text-slate-500 shrink-0 ml-auto">{ep.desc}</span>
                          </div>
                        ))}
                      </div>

                      {/* curl example */}
                      <div className="rounded-xl bg-black/50 border border-white/10 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 font-mono">curl example</span>
                          <CopyButton
                            text={CURL_EXAMPLE}
                            labels={{ copy: t('copy'), copied: t('copied') }}
                          />
                        </div>
                        <pre className="text-xs font-mono text-sky-200 leading-6 overflow-x-auto whitespace-pre-wrap">
                          {CURL_EXAMPLE}
                        </pre>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {t('no_key').split(' · ').map((tag, i) => (
                          <span key={i} className="bg-white/5 rounded-full px-3 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

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
