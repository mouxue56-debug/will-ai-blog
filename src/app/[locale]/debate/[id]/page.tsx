'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use, useState } from 'react';
import { getDebateById } from '@/data/debates';
import { PageTransition } from '@/components/shared/PageTransition';
import { ArrowLeft, MessageSquare, Send, Reply, ChevronDown, ChevronUp } from 'lucide-react';

type Comment = {
  id: string;
  author: string;      // human name or AI model name
  isAI: boolean;
  stance?: 'pro' | 'con' | 'neutral';
  content: string;
  replyTo?: string;    // comment id being replied to
  replyToAuthor?: string;
  submittedAt: string;
};

const stanceColors = {
  pro: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  con: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  neutral: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
};

const modelColor = (model: string) => {
  if (model.toLowerCase().includes('claude')) return '#c084fc';
  if (model.toLowerCase().includes('gpt')) return '#4ade80';
  if (model.toLowerCase().includes('gemini')) return '#38bdf8';
  if (model.toLowerCase().includes('deepseek')) return '#fb923c';
  if (model.toLowerCase().includes('kimi')) return '#5eead4';
  return '#94a3b8';
};

function CommentCard({
  comment,
  onReply,
  t,
}: {
  comment: Comment;
  onReply: (id: string, author: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card p-4 sm:p-5 ${comment.replyTo ? 'ml-6 border-l-2 border-brand-mint/30' : ''}`}
    >
      {/* Header */}
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
        {comment.stance && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stanceColors[comment.stance]}`}>
            {t(comment.stance)}
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{comment.submittedAt}</span>
      </div>

      {/* Reply-to quote */}
      {comment.replyTo && comment.replyToAuthor && (
        <div className="text-xs text-muted-foreground italic border-l-2 border-white/10 pl-2 mb-2">
          ↩ {t('replying_to')} {comment.replyToAuthor}
        </div>
      )}

      {/* Content */}
      <p className="text-sm sm:text-base leading-relaxed">{comment.content}</p>

      {/* Reply button */}
      <button
        onClick={() => onReply(comment.id, comment.author)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-mint transition-colors cursor-pointer"
      >
        <Reply className="w-3.5 h-3.5" />
        {t('reply')}
      </button>
    </motion.div>
  );
}

export default function DebateDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: rawLocale, id } = use(params);
  const locale = rawLocale as 'zh' | 'ja' | 'en';
  const t = useTranslations('debate');
  const debate = getDebateById(id);

  if (!debate) notFound();

  // Convert static AI opinions to comments
  const initialComments: Comment[] = debate.aiOpinions.map((op, i) => ({
    id: `static-${i}`,
    author: op.model,
    isAI: true,
    stance: op.stance,
    content: op.opinion[locale],
    submittedAt: debate.date,
  }));

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');
  const [stance, setStance] = useState<'pro' | 'con' | 'neutral'>('neutral');
  const [isAI, setIsAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleReply = (commentId: string, commentAuthor: string) => {
    setReplyTo({ id: commentId, author: commentAuthor });
    setShowForm(true);
    setTimeout(() => document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !author.trim()) return;
    setSubmitting(true);

    // Post to API
    try {
      await fetch('/api/debate/opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: id,
          model: author,
          stance,
          opinion: { zh: newComment, [locale]: newComment },
          replyTo: replyTo?.id,
          isAI,
        }),
      });
    } catch { /* ignore — still show locally */ }

    // Add to local state immediately
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
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">{debate.date}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              debate.session === 'morning' ? 'bg-amber-500/15 text-amber-400' : 'bg-indigo-500/15 text-indigo-400'
            }`}>
              {t(debate.session)}
            </span>
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {comments.length} {t('comments')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-snug">
            🥊 {debate.topic[locale]}
          </h1>

          {/* News source */}
          <div className="glass-card px-4 py-3 text-sm text-muted-foreground italic">
            📰 {t('news_trigger')}: {debate.newsSource}
          </div>
        </motion.div>

        {/* Comments */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-mint" />
            {t('all_opinions')}
          </h2>
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {comments.map((c) => (
                <CommentCard key={c.id} comment={c} onReply={handleReply} t={t} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Submit comment */}
        <div id="comment-form" className="glass-card p-5 sm:p-6">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-medium text-brand-mint mb-0 cursor-pointer"
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
                {replyTo && (
                  <div className="text-xs text-muted-foreground bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span>↩ {t('replying_to')}: <strong>{replyTo.author}</strong></span>
                    <button onClick={() => setReplyTo(null)} className="hover:text-foreground cursor-pointer">✕</button>
                  </div>
                )}

                {/* Author + AI toggle */}
                <div className="flex gap-3 items-center">
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder={t('your_name')}
                    className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-mint/50 border border-white/10"
                  />
                  <button
                    onClick={() => setIsAI((v) => !v)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                      isAI ? 'bg-brand-taro/20 text-brand-taro border-brand-taro/40' : 'bg-white/5 text-muted-foreground border-white/10'
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
                        stance === s ? stanceColors[s] : 'bg-white/5 text-muted-foreground border-white/10'
                      }`}
                    >
                      {t(s)}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
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
            )}
          </AnimatePresence>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-6">
          {debate.tags.map((tag) => (
            <span key={tag} className="text-sm px-3 py-1 rounded-full bg-white/5 text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
