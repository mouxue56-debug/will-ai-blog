'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Bot, Crown, UserCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Supports both Redis API (postSlug) and Supabase API (post_slug) response shapes
interface ApiComment {
  // Supabase shape
  id?: string;
  author_name?: string;
  author_emoji?: string;
  is_ai?: boolean;
  content?: string;
  created_at?: string;
  // Redis shape
  postSlug?: string;
  author?: string;
  authorType?: 'human' | 'ai' | 'guest' | 'admin';
  authorRole?: 'admin' | 'user';
  aiModel?: string;
  createdAt?: string;
  approved?: boolean;
}

interface NormalizedComment {
  id: string;
  authorName: string;
  authorEmoji: string;
  isAI: boolean;
  isAdmin: boolean;
  aiModel?: string;
  content: string;
  createdAt: string;
}

function normalize(c: ApiComment, idx: number): NormalizedComment {
  // Supabase shape
  if (c.author_name !== undefined) {
    return {
      id: c.id ?? String(idx),
      authorName: c.author_name ?? 'Guest',
      authorEmoji: c.author_emoji ?? '👤',
      isAI: c.is_ai ?? false,
      isAdmin: false,
      content: c.content ?? '',
      createdAt: c.created_at ?? new Date().toISOString(),
    };
  }
  // Redis shape
  const isAI = c.authorType === 'ai';
  const isAdmin = c.authorRole === 'admin' || c.authorType === 'admin';
  return {
    id: c.id ?? String(idx),
    authorName: c.author ?? 'Guest',
    authorEmoji: isAI ? '🤖' : isAdmin ? '👑' : '👤',
    isAI,
    isAdmin,
    aiModel: c.aiModel,
    content: c.content ?? '',
    createdAt: c.createdAt ?? new Date().toISOString(),
  };
}

interface CommentSectionProps {
  postSlug: string;
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<NormalizedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadComments = useCallback(async () => {
    try {
      // Try Supabase-style API first (post_slug), fall back to Redis-style (postSlug)
      const res = await fetch(`/api/comments?post_slug=${encodeURIComponent(postSlug)}&postSlug=${encodeURIComponent(postSlug)}&approved=true`);
      if (res.ok) {
        const data = await res.json();
        const raw: ApiComment[] = data.comments ?? [];
        setComments(raw.map(normalize));
      }
    } catch {
      // Silently keep empty on error
    }
    setLoading(false);
  }, [postSlug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const submitComment = async () => {
    if (!content.trim() || !authorName.trim()) return;
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Both field names for compatibility
          post_slug: postSlug,
          postSlug,
          author_name: authorName,
          author: authorName,
          author_emoji: '👤',
          content,
          authorType: 'guest',
        }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || '今天评论次数已用完，每天最多5条～');
        setTimeout(() => setError(''), 6000);
      } else if (res.ok) {
        const data = await res.json();
        const newComment = data.comment ? normalize(data.comment, comments.length) : null;
        if (newComment && newComment.isAI === false) {
          // Auto-approved (e.g. logged-in user) — add immediately
          if ((data.comment as ApiComment).approved) {
            setComments(prev => [...prev, newComment]);
          } else {
            // Guest: pending review
            setSuccessMsg('✅ 评论已提交，审核通过后显示～');
            setTimeout(() => setSuccessMsg(''), 5000);
          }
        }
        setContent('');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || '提交失败，请稍后再试');
        setTimeout(() => setError(''), 4000);
      }
    } catch {
      setError('提交失败，请稍后再试');
      setTimeout(() => setError(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12" id="comments">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5" style={{ color: '#00D4FF' }} />
        <h3 className="text-lg font-semibold" style={{ color: '#00D4FF' }}>
          评论{comments.length > 0 && ` (${comments.length})`}
        </h3>
      </div>

      {/* Comment list */}
      <div className="flex flex-col gap-4 mb-8">
        {loading && (
          <div className="py-8 text-center text-sm text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-slate-600" />
            加载中...
          </div>
        )}

        <AnimatePresence>
          {comments.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl p-4"
              style={{
                background: c.isAI
                  ? 'rgba(0,212,255,0.04)'
                  : c.isAdmin
                  ? 'rgba(251,191,36,0.04)'
                  : 'rgba(255,255,255,0.03)',
                border: c.isAI
                  ? '1px solid rgba(0,212,255,0.15)'
                  : c.isAdmin
                  ? '1px solid rgba(251,191,36,0.15)'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xl">{c.authorEmoji}</span>
                <span className={cn(
                  'font-medium text-sm',
                  c.isAdmin ? 'text-amber-400' : 'text-white'
                )}>
                  {c.authorName}
                </span>

                {/* AI badge */}
                {c.isAI && (
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(0,212,255,0.1)',
                      color: '#00D4FF',
                      border: '1px solid rgba(0,212,255,0.2)',
                    }}
                  >
                    <Bot className="h-3 w-3" />
                    AI{c.aiModel ? ` · ${c.aiModel}` : ''}
                  </span>
                )}

                {/* Admin badge */}
                {c.isAdmin && !c.isAI && (
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(251,191,36,0.1)',
                      color: 'rgb(251,191,36)',
                      border: '1px solid rgba(251,191,36,0.2)',
                    }}
                  >
                    <Crown className="h-3 w-3" />
                    Admin
                  </span>
                )}

                <span className="text-xs text-slate-600 ml-auto">
                  {new Date(c.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,244,248,0.8)' }}>
                {c.content}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && comments.length === 0 && (
          <p className="text-sm text-slate-600 py-4 text-center">还没有评论，来说点什么吧～</p>
        )}
      </div>

      {/* Success / error messages */}
      {successMsg && (
        <div
          className="mb-4 rounded-lg p-3 text-sm text-center"
          style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}
        >
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg p-3 text-sm text-center text-red-400"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Comment form */}
      <div
        className="rounded-xl p-5"
        style={{ background: '#0D1825', border: '1px solid rgba(0,212,255,0.12)' }}
      >
        <h4 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
          <UserCircle className="h-4 w-4" />
          发表评论
        </h4>

        <input
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          placeholder="你的名字（必填）"
          maxLength={30}
          className="w-full mb-3 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/40 transition-colors"
        />

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="写下你的想法... (最多 1000 字)"
          rows={3}
          maxLength={1000}
          className="w-full mb-3 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/40 resize-none transition-colors"
        />

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-600">{content.length}/1000</span>
          <button
            onClick={submitComment}
            disabled={submitting || !content.trim() || !authorName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
            style={{
              background: 'rgba(0,212,255,0.15)',
              color: '#00D4FF',
              border: '1px solid rgba(0,212,255,0.3)',
            }}
          >
            <Send className="h-4 w-4" />
            {submitting ? '提交中...' : '发表评论'}
          </button>
        </div>
      </div>
    </section>
  );
}
