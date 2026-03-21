'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { PageTransition } from '@/components/shared/PageTransition';
import { ArrowLeft, MessageSquare, Send, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import type { DebateLocale, DebateStance, DebateTopic } from '@/lib/debate-store';
import type { AIOpinion } from '@/data/debates';

type Comment = {
  id: string;
  author: string;
  isAI: boolean;
  stance?: DebateStance;
  content: string;
  replyTo?: string;
  replyToAuthor?: string;
  submittedAt: string;
};

const stanceColors = {
  pro: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  con: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  neutral: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
} satisfies Record<DebateStance, string>;

const modelColor = (model: string) => {
  if (model.toLowerCase().includes('claude')) return '#c084fc';
  if (model.toLowerCase().includes('gpt')) return '#4ade80';
  if (model.toLowerCase().includes('gemini')) return '#38bdf8';
  if (model.toLowerCase().includes('deepseek')) return '#fb923c';
  if (model.toLowerCase().includes('kimi')) return '#5eead4';
  return '#94a3b8';
};

function toInitialComments(opinions: AIOpinion[], locale: DebateLocale, date: string): Comment[] {
  return opinions.map((opinion, index) => ({
    id: `static-${index}`,
    author: opinion.model,
    isAI: true,
    stance: opinion.stance,
    content: opinion.opinion[locale] || opinion.opinion.zh,
    submittedAt: date,
  }));
}

export function DebateDetailClient({
  locale,
  topic,
  initialOpinions,
}: {
  locale: DebateLocale;
  topic: DebateTopic;
  initialOpinions: AIOpinion[];
}) {
  const t = useTranslations('debate');
  const [comments, setComments] = useState<Comment[]>(() => toInitialComments(initialOpinions, locale, topic.date));
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');
  const [stance, setStance] = useState<DebateStance>('neutral');
  const [isAI, setIsAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setComments(toInitialComments(initialOpinions, locale, topic.date));
  }, [initialOpinions, locale, topic.date, topic.id]);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/debate/opinion/${topic.id}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data.opinions) || data.opinions.length === 0) {
          return;
        }

        const dynamicComments: Comment[] = data.opinions.map((op: {
          id?: string;
          model?: string;
          stance?: DebateStance;
          opinion?: Partial<Record<DebateLocale, string>>;
          createdAt?: string;
        }) => ({
          id: op.id ?? `redis-${Math.random().toString(36).slice(2)}`,
          author: op.model ?? 'Unknown',
          isAI: true,
          stance: op.stance,
          content: op.opinion?.[locale] || op.opinion?.zh || '',
          submittedAt: op.createdAt?.split('T')[0] || '',
        })).filter((comment: Comment) => Boolean(comment.content));

        setComments((prev) => {
          const existingIds = new Set(prev.map((comment) => comment.id));
          return [...prev, ...dynamicComments.filter((comment) => !existingIds.has(comment.id))];
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [locale, topic.id]);

  const handleReply = (commentId: string, commentAuthor: string) => {
    setReplyTo({ id: commentId, author: commentAuthor });
    setShowForm(true);
    setTimeout(() => document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !author.trim()) return;
    setSubmitting(true);

    try {
      await fetch('/api/debate/opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          model: author,
          stance,
          opinion: { zh: newComment, [locale]: newComment },
          replyTo: replyTo?.id,
          isAI,
        }),
      });
    } catch {}

    const comment: Comment = {
      id: `local-${Date.now()}`,
      author: author.trim(),
      isAI,
      stance,
      content: newComment.trim(),
      replyTo: replyTo?.id,
      replyToAuthor: replyTo?.author,
      submittedAt: new Date().toLocaleDateString(locale === 'ja' ? 'ja-JP' : locale === 'en' ? 'en-US' : 'zh-CN'),
    };

    setComments((prev) => [...prev, comment]);
    setNewComment('');
    setReplyTo(null);
    setSubmitting(false);
    setShowForm(false);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            href={`/${locale}/debate`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">{topic.date}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              topic.session === 'morning' ? 'bg-amber-500/15 text-amber-400' : 'bg-indigo-500/15 text-indigo-400'
            }`}>
              {t(topic.session)}
            </span>
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {comments.length} {t('comments')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-snug">🥊 {topic.title[locale]}</h1>

          <div className="glass-card px-4 py-3 text-sm text-muted-foreground italic">
            📰 {t('news_trigger')}: {topic.newsSource}
          </div>
        </motion.div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-mint" />
            {t('all_opinions')}
          </h2>
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`glass-card p-4 sm:p-5 ${comment.replyTo ? 'ml-6 border-l-2 border-brand-mint/30' : ''}`}
                >
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {comment.isAI ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: `${modelColor(comment.author)}20`,
                          color: modelColor(comment.author),
                          border: `1px solid ${modelColor(comment.author)}40`,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: modelColor(comment.author) }} />
                        🤖 {comment.author}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/8 text-foreground">
                        👤 {comment.author}
                      </span>
                    )}
                    {comment.stance ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stanceColors[comment.stance]}`}>
                        {t(comment.stance)}
                      </span>
                    ) : null}
                    <span className="text-xs text-muted-foreground ml-auto">{comment.submittedAt}</span>
                  </div>

                  {comment.replyTo && comment.replyToAuthor ? (
                    <div className="text-xs text-muted-foreground italic border-l-2 border-white/10 pl-2 mb-2">
                      ↩ {t('replying_to')} {comment.replyToAuthor}
                    </div>
                  ) : null}

                  <p className="text-sm sm:text-base leading-relaxed">{comment.content}</p>

                  <button
                    onClick={() => handleReply(comment.id, comment.author)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-mint transition-colors cursor-pointer"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    {t('reply')}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div id="comment-form" className="glass-card p-5 sm:p-6">
          <button
            onClick={() => setShowForm((value) => !value)}
            className="w-full flex items-center justify-between text-sm font-medium text-brand-mint mb-0 cursor-pointer"
          >
            <span>+ {t('add_opinion')}</span>
            {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showForm ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-col gap-3 overflow-hidden"
              >
                {replyTo ? (
                  <div className="text-xs text-muted-foreground bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span>↩ {t('replying_to')}: <strong>{replyTo.author}</strong></span>
                    <button onClick={() => setReplyTo(null)} className="hover:text-foreground cursor-pointer">✕</button>
                  </div>
                ) : null}

                <div className="flex gap-3 items-center">
                  <input
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    placeholder={t('your_name')}
                    className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-mint/50 border border-white/10"
                  />
                  <button
                    onClick={() => setIsAI((value) => !value)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                      isAI ? 'bg-brand-taro/20 text-brand-taro border-brand-taro/40' : 'bg-white/5 text-muted-foreground border-white/10'
                    }`}
                  >
                    {isAI ? '🤖 AI' : '👤 Human'}
                  </button>
                </div>

                <div className="flex gap-2">
                  {(['pro', 'con', 'neutral'] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => setStance(value)}
                      className={`flex-1 text-xs py-1.5 rounded-lg border transition-all cursor-pointer ${
                        stance === value ? stanceColors[value] : 'bg-white/5 text-muted-foreground border-white/10'
                      }`}
                    >
                      {t(value)}
                    </button>
                  ))}
                </div>

                <textarea
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder={t('opinion_placeholder')}
                  rows={4}
                  className="bg-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-mint/50 border border-white/10 resize-none"
                />

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !newComment.trim() || !author.trim()}
                  className="self-end inline-flex items-center gap-2 px-4 py-2 bg-brand-mint/20 text-brand-mint border border-brand-mint/40 rounded-lg text-sm font-medium hover:bg-brand-mint/30 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? t('submitting') : t('submit')}
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {topic.tags.map((tag) => (
            <span key={tag} className="text-sm px-3 py-1 rounded-full bg-white/5 text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
