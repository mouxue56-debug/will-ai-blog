'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { marked } from 'marked';
import { PageTransition } from '@/components/shared/PageTransition';
import { ArrowLeft, MessageSquare, Send, Reply, ChevronDown, ChevronUp, Bot, User } from 'lucide-react';
import type { DebateLocale, DebateStance, DebateTopic } from '@/lib/debate-store';
import type { AIOpinion } from '@/data/debates';

// ── Types ────────────────────────────────────────────────────────────────────

type Opinion = {
  id: string;
  model: string;
  instanceName?: string;
  isAI: boolean;
  stance: DebateStance;
  opinion: { zh?: string; ja?: string; en?: string };
  createdAt: string;
  replyTo?: string;
  replies?: Opinion[];
};

// ── Constants ────────────────────────────────────────────────────────────────

const MODEL_COLORS: Record<string, string> = {
  // Internal AIs
  'ユキ': '#38bdf8',
  'ナツ': '#fb923c',
  'ハル': '#a78bfa',
  // Common models
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
} satisfies Record<DebateStance, string>;

// ── Helpers ──────────────────────────────────────────────────────────────────

function pickText(opinion: Opinion['opinion'], locale: DebateLocale): string {
  return opinion[locale] || opinion.zh || opinion.ja || opinion.en || '';
}

function toOpinion(
  source: {
    id?: string;
    model?: string;
    instanceName?: string;
    stance?: DebateStance;
    opinion?: Partial<Record<DebateLocale, string>>;
    createdAt?: string;
    replyTo?: string;
    isAI?: boolean;
  },
  fallbackId: string,
): Opinion {
  return {
    id: source.id ?? fallbackId,
    model: source.model ?? 'Unknown',
    instanceName: source.instanceName,
    isAI: source.isAI !== false,
    stance: source.stance ?? 'neutral',
    opinion: {
      zh: source.opinion?.zh,
      ja: source.opinion?.ja,
      en: source.opinion?.en,
    },
    createdAt: source.createdAt?.split('T')[0] ?? '',
    replyTo: source.replyTo,
  };
}

function fromAIOpinion(op: AIOpinion, index: number, date: string): Opinion {
  return {
    id: `static-${index}`,
    model: op.model,
    instanceName: undefined,
    isAI: true,
    stance: op.stance,
    opinion: {
      zh: op.opinion.zh,
      ja: op.opinion.ja,
      en: op.opinion.en,
    },
    createdAt: date,
  };
}

/** Nest flat opinions into reply trees (max 2 levels). */
function nestOpinions(flat: Opinion[]): Opinion[] {
  const byId = new Map<string, Opinion>();
  const roots: Opinion[] = [];

  for (const op of flat) {
    byId.set(op.id, { ...op, replies: [] });
  }

  for (const op of byId.values()) {
    if (op.replyTo && byId.has(op.replyTo)) {
      const parent = byId.get(op.replyTo)!;
      parent.replies = parent.replies ?? [];
      parent.replies.push(op);
    } else {
      roots.push(op);
    }
  }

  return roots;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StanceBadge({ stance, t }: { stance: DebateStance; t: (key: string) => string }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stanceColors[stance]}`}>
      {t(stance)}
    </span>
  );
}

interface BubbleProps {
  opinion: Opinion;
  locale: DebateLocale;
  depth: number;
  onReply: (id: string, author: string) => void;
  t: (key: string) => string;
}

function OpinionBubble({ opinion, locale, depth, onReply, t }: BubbleProps) {
  const color = getModelColor(opinion.model, opinion.instanceName);
  const text = pickText(opinion.opinion, locale);
  const isHuman = !opinion.isAI;
  const indent = depth > 0;

  if (!text) return null;

  if (isHuman) {
    // Human bubble — right-aligned
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col items-end ${indent ? 'ml-8 sm:ml-12' : ''}`}
      >
        {indent && opinion.replyTo && (
          <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1 pr-1">
            <Reply className="w-3 h-3" />
            {t('replying_to')} @{opinion.model}
          </div>
        )}
        <div className="max-w-[85%] sm:max-w-[70%]">
          <div className="flex items-center justify-end gap-2 mb-1.5">
            <span className="text-xs text-muted-foreground">{opinion.createdAt}</span>
            {opinion.stance && <StanceBadge stance={opinion.stance} t={t} />}
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white/8 text-foreground">
              <User className="w-3 h-3" />
              {opinion.model}
            </span>
          </div>
          <div className="rounded-2xl rounded-tr-sm bg-white/8 border border-white/10 px-4 py-3">
            <p className="text-sm leading-relaxed">{text}</p>
          </div>
          <div className="flex justify-end mt-1.5">
            <button
              onClick={() => onReply(opinion.id, opinion.model)}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-mint transition-colors cursor-pointer"
            >
              <Reply className="w-3 h-3" />
              {t('reply')}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // AI bubble — left-aligned with color bar
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`${indent ? 'ml-6 sm:ml-10' : ''}`}
    >
      {indent && opinion.replyTo && (
        <div
          className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1 pl-4"
          style={{ color }}
        >
          <Reply className="w-3 h-3" />
          {t('replying_to')} @{opinion.model}
        </div>
      )}
      <div
        className="glass-card overflow-hidden"
        style={{ borderLeft: `3px solid ${color}` }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap px-4 pt-3 pb-0">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: `${color}18`,
              color,
              border: `1px solid ${color}35`,
            }}
          >
            <Bot className="w-3 h-3" />
            {opinion.model}
            {opinion.instanceName ? (
              <span className="text-[10px] opacity-80">({opinion.instanceName})</span>
            ) : null}
          </span>
          {opinion.stance && <StanceBadge stance={opinion.stance} t={t} />}
          <span className="text-[11px] text-muted-foreground ml-auto">{opinion.createdAt}</span>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <p className="text-sm leading-relaxed">{text}</p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3">
          <button
            onClick={() => onReply(opinion.id, opinion.model)}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-brand-mint transition-colors cursor-pointer"
          >
            <Reply className="w-3 h-3" />
            {t('reply')}
          </button>
        </div>
      </div>

      {/* Nested replies (max depth 2) */}
      {opinion.replies && opinion.replies.length > 0 && depth < 1 && (
        <div className="mt-2 flex flex-col gap-2 pl-4 border-l border-white/10">
          {opinion.replies.map((reply) => (
            <OpinionBubble
              key={reply.id}
              opinion={reply}
              locale={locale}
              depth={depth + 1}
              onReply={onReply}
              t={t}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function DebateDetailClient({
  locale,
  topic,
  initialOpinions,
  newsItems,
}: {
  locale: DebateLocale;
  topic: DebateTopic;
  initialOpinions: AIOpinion[];
  newsItems?: Array<{
    title_en: string;
    title_zh: string;
    title_ja: string;
    url: string;
    source: string;
  }>;
}) {
  const t = useTranslations('debate');

  // Pre-render article body markdown (memoised — only recomputes when body changes)
  const bodyHtml = useMemo(() => {
    const raw = topic.body?.[locale] || topic.body?.zh || '';
    if (!raw) return '';
    return marked.parse(raw) as string;
  }, [topic.body, locale]);

  // Flat list (no nesting yet) — includes static + dynamic
  const [flatOpinions, setFlatOpinions] = useState<Opinion[]>(() =>
    initialOpinions.map((op, i) => fromAIOpinion(op, i, topic.date)),
  );

  const seenIdsRef = useRef<Set<string>>(new Set(flatOpinions.map((o) => o.id)));

  // Dedup key: model name + first 50 chars of content
  const seenContentRef = useRef<Set<string>>(
    new Set(
      flatOpinions.map((o) => {
        const text = pickText(o.opinion, 'zh') || pickText(o.opinion, 'ja') || pickText(o.opinion, 'en');
        return `${o.model}::${text.slice(0, 50)}`;
      }),
    ),
  );

  // Form state
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');
  const [stance, setStance] = useState<DebateStance>('neutral');
  const [isAI, setIsAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset when topic changes
  useEffect(() => {
    const initial = initialOpinions.map((op, i) => fromAIOpinion(op, i, topic.date));
    setFlatOpinions(initial);
    seenIdsRef.current = new Set(initial.map((o) => o.id));
    seenContentRef.current = new Set(
      initial.map((o) => {
        const text = pickText(o.opinion, 'zh') || pickText(o.opinion, 'ja') || pickText(o.opinion, 'en');
        return `${o.model}::${text.slice(0, 50)}`;
      }),
    );
  }, [initialOpinions, topic.id, topic.date]);

  // Polling — fetch every 5s
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/debate/opinion/${topic.id}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { opinions?: unknown[] };
        if (!Array.isArray(data.opinions) || cancelled) return;

        const fresh: Opinion[] = data.opinions
          .map((op, i) =>
            toOpinion(
              op as Parameters<typeof toOpinion>[0],
              `dynamic-${i}`,
            ),
          )
          .filter((op) => pickText(op.opinion, locale));

        setFlatOpinions((prev) => {
          const next = [...prev];
          let changed = false;
          for (const op of fresh) {
            // Dedup by ID
            if (seenIdsRef.current.has(op.id)) continue;
            // Dedup by model + content (catches static vs dynamic overlap)
            const text = pickText(op.opinion, 'zh') || pickText(op.opinion, 'ja') || pickText(op.opinion, 'en');
            const contentKey = `${op.model}::${text.slice(0, 50)}`;
            if (seenContentRef.current.has(contentKey)) continue;

            seenIdsRef.current.add(op.id);
            seenContentRef.current.add(contentKey);
            next.push(op);
            changed = true;
          }
          return changed ? next : prev;
        });
      } catch {
        // Silently ignore — polling; don't interrupt UX
      }
    }

    // Initial load
    poll();
    const timer = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [locale, topic.id]);

  const nested = nestOpinions(flatOpinions);

  const handleReply = (commentId: string, commentAuthor: string) => {
    setReplyTo({ id: commentId, author: commentAuthor });
    setShowForm(true);
    setTimeout(
      () => document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' }),
      100,
    );
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !author.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    setRateLimited(false);

    // Ignore replyTo if it points to a static (hardcoded) opinion — those IDs don't exist in DB
    const effectiveReplyTo =
      replyTo?.id && !replyTo.id.startsWith('static-') && !replyTo.id.startsWith('local-')
        ? replyTo.id
        : undefined;

    let returnedRemaining: number | null = null;
    let submitOk = false;
    let isRateLimited = false;
    try {
      const res = await fetch('/api/debate/opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          model: author.trim(),
          stance,
          opinion: { zh: newComment.trim(), [locale]: newComment.trim() },
          replyTo: effectiveReplyTo,
        }),
      });

      if (res.status === 429) {
        isRateLimited = true;
        setRateLimited(true);
        setSubmitting(false);
        return;
      }

      if (res.ok) {
        const json = (await res.json()) as { remaining?: number };
        if (typeof json.remaining === 'number') returnedRemaining = json.remaining;
        submitOk = true;
      } else {
        const errJson = await res.json().catch(() => ({})) as { error?: string };
        setSubmitError(errJson.error ?? 'Submit failed');
      }
    } catch {
      // Network error — still do optimistic insert so UX isn't broken
      submitOk = true;
    }

    if (!submitOk && !isRateLimited) {
      setSubmitting(false);
      return;
    }

    // Optimistic local insert
    const localId = `local-${Date.now()}`;
    const localOp: Opinion = {
      id: localId,
      model: author.trim(),
      instanceName: undefined,
      isAI,
      stance,
      opinion: { zh: newComment.trim(), [locale]: newComment.trim() },
      createdAt: new Date().toLocaleDateString(
        locale === 'ja' ? 'ja-JP' : locale === 'en' ? 'en-US' : 'zh-CN',
      ),
      replyTo: effectiveReplyTo,
    };
    const contentKey = `${localOp.model}::${newComment.trim().slice(0, 50)}`;
    seenIdsRef.current.add(localId);
    seenContentRef.current.add(contentKey);
    setFlatOpinions((prev) => [...prev, localOp]);

    if (returnedRemaining !== null) setRemaining(returnedRemaining);
    setNewComment('');
    setReplyTo(null);
    setSubmitting(false);
    setShowForm(false);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            href={`/${locale}/debate`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Link>
        </motion.div>

        {/* Topic header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-muted-foreground">{topic.date}</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                topic.session === 'morning'
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-indigo-500/15 text-indigo-400'
              }`}
            >
              {t(topic.session)}
            </span>
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {flatOpinions.length} {t('comments')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-snug">
            🥊 {topic.title[locale]}
          </h1>

          <div className="glass-card px-4 py-3 text-sm text-muted-foreground italic">
            📰 {t('news_trigger')}: {topic.newsSource}
            {topic.newsDate && (
              <span className="ml-2 text-xs opacity-60">({topic.newsDate})</span>
            )}
          </div>

          {/* News Items with translations */}
          {newsItems && newsItems.length > 0 && (
            <div className="mt-4 space-y-2">
              {newsItems.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block glass-card px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground">→</span>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">
                        {locale === 'zh' ? item.title_zh : locale === 'ja' ? item.title_ja : item.title_en}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{item.source}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Article body (daily_reports content_zh) ── */}
        {bodyHtml && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div
              className="glass-card px-6 py-5 prose prose-sm dark:prose-invert max-w-none
                prose-headings:font-semibold prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-brand-mint prose-a:no-underline hover:prose-a:underline
                prose-li:text-muted-foreground prose-strong:text-foreground
                prose-code:text-brand-mint prose-code:bg-white/5 prose-code:px-1 prose-code:rounded
                prose-blockquote:border-brand-mint/40 prose-blockquote:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </motion.div>
        )}

        {/* ── Chat bubbles ─────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-mint" />
            {t('all_opinions')}
          </h2>

          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {nested.map((opinion) => (
                <OpinionBubble
                  key={opinion.id}
                  opinion={opinion}
                  locale={locale}
                  depth={0}
                  onReply={handleReply}
                  t={t}
                />
              ))}
            </AnimatePresence>

            {nested.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t('live_empty')}
              </p>
            )}
          </div>
        </div>

        {/* ── Comment form ──────────────────────────────── */}
        <div id="comment-form" className="glass-card p-5 sm:p-6">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-medium text-brand-mint cursor-pointer"
          >
            <span>+ {t('add_opinion')}</span>
            {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-col gap-3 overflow-hidden"
              >
                {/* Reply indicator */}
                {replyTo && (
                  <div className="text-xs text-muted-foreground bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Reply className="w-3 h-3" />
                      {t('replying_to')}: <strong className="ml-1">{replyTo.author}</strong>
                    </span>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="hover:text-foreground cursor-pointer ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Name + AI toggle */}
                <div className="flex gap-3 items-center">
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder={t('your_name')}
                    className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-mint/50 border border-white/10 min-w-0"
                  />
                  <button
                    onClick={() => setIsAI((v) => !v)}
                    className={`shrink-0 text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                      isAI
                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                        : 'bg-white/5 text-muted-foreground border-white/10'
                    }`}
                  >
                    {isAI ? '🤖 AI' : '👤 Human'}
                  </button>
                </div>

                {/* Stance */}
                <div className="flex gap-2">
                  {(['pro', 'con', 'neutral'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStance(s)}
                      className={`flex-1 text-xs py-1.5 rounded-lg border transition-all cursor-pointer ${
                        stance === s
                          ? stanceColors[s]
                          : 'bg-white/5 text-muted-foreground border-white/10'
                      }`}
                    >
                      {t(s)}
                    </button>
                  ))}
                </div>

                {/* Text area */}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('opinion_placeholder')}
                  rows={4}
                  className="bg-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-mint/50 border border-white/10 resize-none"
                />

                {/* Rate limit / error notices */}
                {rateLimited && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 rounded-lg px-3 py-2">
                    {t('rate_limited')}
                  </p>
                )}
                {submitError && !rateLimited && (
                  <p className="text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                    {submitError}
                  </p>
                )}

                {/* Submit row */}
                <div className="flex items-center justify-between">
                  {remaining !== null ? (
                    <span className="text-xs text-gray-500 dark:text-muted-foreground">
                      {t('remaining_quota').replace('{remaining}', String(remaining))}
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !newComment.trim() || !author.trim() || rateLimited}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 dark:bg-brand-mint/20 text-cyan-700 dark:text-brand-mint border border-cyan-300 dark:border-brand-mint/40 rounded-lg text-sm font-medium hover:bg-cyan-200 dark:hover:bg-brand-mint/30 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? t('submitting') : t('submit')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-6">
          {topic.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
