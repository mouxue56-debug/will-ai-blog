'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { MessageSquare, Send, Bot, Crown, UserCircle } from 'lucide-react';
import Image from 'next/image';
import type { Comment } from '@/lib/blog-types';
import { cn } from '@/lib/utils';

interface ApiComment {
  id: string;
  postSlug: string;
  author: string;
  content: string;
  authorType: 'human' | 'ai' | 'guest' | 'admin';
  authorRole?: 'admin' | 'user';
  aiModel?: string;
  aiInstance?: string;
  createdAt: string;
  approved: boolean;
}

interface CommentSectionProps {
  comments: Comment[];
  postSlug?: string;
}

function CommentItem({ comment }: { comment: Comment & { authorRole?: string } }) {
  const isAdmin = comment.authorRole === 'admin';

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg p-4 transition-colors relative overflow-hidden',
        comment.isAI
          ? 'bg-brand-cyan/5 ring-1 ring-brand-cyan/20'
          : isAdmin
          ? 'bg-amber-500/5 ring-1 ring-amber-500/20'
          : 'bg-secondary/50'
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg',
        comment.isAI
          ? 'bg-brand-cyan/15'
          : isAdmin
          ? 'bg-amber-500/15'
          : 'bg-muted'
      )}>
        {comment.avatar}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            'text-sm font-semibold',
            isAdmin && 'text-amber-400'
          )}>
            {comment.author}
          </span>

          {/* AI badge */}
          {comment.isAI && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/15 px-2 py-0.5 text-[10px] font-medium text-brand-cyan">
              <Bot className="h-3 w-3" />
              🤖 AI · {comment.model}
            </span>
          )}

          {/* Admin badge */}
          {isAdmin && !comment.isAI && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
              <Crown className="h-3 w-3" />
              👑 Admin
            </span>
          )}

          <span className="ml-auto text-xs text-muted-foreground">
            {new Date(comment.date).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

function apiToComment(c: ApiComment): Comment & { authorRole?: string } {
  return {
    id: c.id,
    author: c.author,
    avatar: c.authorType === 'ai' ? '🤖' : c.authorType === 'admin' ? '👑' : c.authorRole === 'admin' ? '👑' : '👤',
    date: c.createdAt.split('T')[0],
    content: c.content,
    isAI: c.authorType === 'ai',
    model: c.aiModel,
    authorRole: c.authorRole || (c.authorType === 'admin' ? 'admin' : undefined),
  };
}

export function CommentSection({ comments: fallbackComments, postSlug }: CommentSectionProps) {
  const t = useTranslations('blog');
  const { data: session } = useSession();
  const [comments, setComments] = useState<(Comment & { authorRole?: string })[]>(fallbackComments);
  const [loaded, setLoaded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isLoggedIn = !!session?.user;

  const loadComments = useCallback(async () => {
    if (!postSlug) return;
    try {
      const res = await fetch(`/api/comments?postSlug=${postSlug}&approved=true`);
      if (res.ok) {
        const data = await res.json();
        const apiComments: ApiComment[] = data.comments || [];
        if (apiComments.length > 0) {
          setComments(apiComments.map(apiToComment));
        }
      }
    } catch {
      // Keep fallback comments on error
    }
    setLoaded(true);
  }, [postSlug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !postSlug) return;

    // Guest must provide a nickname
    if (!isLoggedIn && !guestName.trim()) return;

    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const body: Record<string, string> = {
        postSlug,
        content: newComment.trim(),
      };

      if (!isLoggedIn) {
        body.author = guestName.trim();
        body.authorType = 'guest';
      }

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setNewComment('');
        setGuestName('');

        if (isLoggedIn) {
          // Logged-in user's comments may be auto-approved, reload
          loadComments();
        } else {
          // Guest comment needs approval — show success message
          setSubmitSuccess(true);
          setTimeout(() => setSubmitSuccess(false), 5000);
        }
      }
    } catch {
      // silent fail
    }
    setSubmitting(false);
  };

  const displayComments = loaded ? comments : fallbackComments;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          {t('comments')} ({displayComments.length})
        </h3>
      </div>

      {/* Comment List */}
      <div className="space-y-3">
        {displayComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {/* Success message for guest comments */}
      {submitSuccess && (
        <div className="rounded-lg border border-brand-mint/30 bg-brand-mint/10 p-4 text-center">
          <p className="text-sm text-brand-mint font-medium">
            ✅ {t('guest_comment_pending') || '评论已提交，审核后将会显示。感谢您的留言！'}
          </p>
        </div>
      )}

      {/* Comment Input — works for both logged-in and guest */}
      <div className="rounded-lg border border-white/[0.06] bg-card p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="shrink-0">
            {isLoggedIn && session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full border border-white/10"
              />
            ) : isLoggedIn ? (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-mint to-brand-cyan flex items-center justify-center text-xs font-bold text-white">
                {(session?.user?.name || 'U').slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="flex-1">
            {/* Guest nickname input */}
            {!isLoggedIn && (
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={t('guest_name_placeholder') || '你的昵称'}
                className="w-full mb-2 rounded-md bg-muted/50 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-brand-cyan/40"
                maxLength={30}
              />
            )}

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isLoggedIn
                ? (t('comment_placeholder') || '分享你的想法...')
                : (t('guest_comment_placeholder') || '分享你的想法...（游客评论需审核后显示）')
              }
              className="w-full resize-none rounded-md bg-muted/50 p-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-brand-cyan/40"
              rows={3}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {isLoggedIn
                  ? session?.user?.name
                  : (t('guest_comment_note') || '游客评论需审核后显示')
                }
              </span>
              <button
                onClick={handleSubmit}
                disabled={submitting || !newComment.trim() || (!isLoggedIn && !guestName.trim())}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-mint/15 text-brand-mint px-4 py-2 text-sm font-medium hover:bg-brand-mint/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {t('submit_comment')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
