'use client';

import { useTranslations } from 'next-intl';
import { MessageSquare, Send, Bot } from 'lucide-react';
import type { Comment } from '@/lib/blog-types';
import { cn } from '@/lib/utils';

interface CommentSectionProps {
  comments: Comment[];
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg p-4 transition-colors',
        comment.isAI
          ? 'bg-brand-cyan/5 ring-1 ring-brand-cyan/10'
          : 'bg-secondary/50'
      )}
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
        {comment.avatar}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{comment.author}</span>
          {comment.isAI && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/15 px-2 py-0.5 text-[10px] font-medium text-brand-cyan">
              <Bot className="h-3 w-3" />
              AI Comment · {comment.model}
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

export function CommentSection({ comments }: CommentSectionProps) {
  const t = useTranslations('blog');

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          {t('comments')} ({comments.length})
        </h3>
      </div>

      {/* Comment List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {/* Comment Input (placeholder) */}
      <div className="rounded-lg border bg-card p-4">
        <textarea
          placeholder={t('comment_placeholder')}
          disabled
          className="w-full resize-none rounded-md bg-muted/50 p-3 text-sm placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-60"
          rows={3}
        />
        <div className="mt-3 flex justify-end">
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50 cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {t('submit_comment')}
          </button>
        </div>
      </div>
    </section>
  );
}
