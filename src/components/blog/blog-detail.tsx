'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogPost, Comment, BlogCategory } from '@/lib/blog-types';
import { CATEGORY_KEYS } from '@/lib/blog-types';
import { Link } from '@/i18n/navigation';
import { PageTransition } from '@/components/shared/PageTransition';
import { MarkdownRenderer } from './markdown-renderer';
import { TableOfContents, type TocHeading } from './table-of-contents';
import { MobileTableOfContents } from './mobile-table-of-contents';
import { CommentSection } from './CommentSection';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import { getAudioUrl } from '@/lib/storage';
import { EnhancedLayout } from './enhanced/EnhancedLayout';

const CATEGORY_TAG_COLORS: Record<BlogCategory, string> = {
  ai: 'bg-brand-cyan/15 text-brand-cyan',
  tech: 'bg-brand-mint/15 text-brand-mint',
  life: 'bg-brand-coral/15 text-brand-coral',
  cats: 'bg-brand-mango/15 text-brand-mango',
  business: 'bg-brand-taro/15 text-brand-taro',
  learning: 'bg-brand-cyan/15 text-brand-cyan',
};

const CONTENT_SOURCE_BADGE = {
  original: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  'ai-organized': 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
} as const;

interface BlogDetailProps {
  post: BlogPost;
  prevPost: BlogPost | null;
  nextPost: BlogPost | null;
  comments: Comment[];
  postSlug?: string;
  headings: TocHeading[];
}

function formatReadingTime(minutes: number, locale: string): string {
  if (locale === 'zh') {
    return `约 ${minutes} 分钟阅读`;
  }

  if (locale === 'ja') {
    return `約 ${minutes} 分で読めます`;
  }

  return `About ${minutes} min read`;
}

function getContentSourceLabel(contentSource: BlogPost['contentSource'], locale: string): string {
  if (locale === 'zh') {
    return contentSource === 'original' ? '原创' : 'AI整理';
  }

  if (locale === 'ja') {
    return contentSource === 'original' ? 'オリジナル' : 'AI整理';
  }

  return contentSource === 'original' ? 'Original' : 'AI Organized';
}

export function BlogDetail({ post, prevPost, nextPost, comments, postSlug, headings }: BlogDetailProps) {
  const locale = useLocale();
  const t = useTranslations('blog');
  const title = post.title[locale] || post.title.zh || post.title.en || '';
  const prevTitle = prevPost ? (prevPost.title[locale] || prevPost.title.zh || prevPost.title.en || '') : '';
  const nextTitle = nextPost ? (nextPost.title[locale] || nextPost.title.zh || nextPost.title.en || '') : '';
  const contentSourceLabel = getContentSourceLabel(post.contentSource, locale);
  const isEnhanced = post.layout === 'enhanced';

  // Enhanced layout - use EnhancedLayout component with progress bar, sticky nav, hero, stats, etc.
  if (isEnhanced) {
    const hero = {
      eyebrow: 'Architecture Deep Dive',
      title: title,
      subtitle: post.excerpt?.[locale] || '',
      date: new Date(post.date).toLocaleDateString(
        locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      ),
      tags: post.tags || [],
    };

    const stats = [
      { label: 'AI Instances', value: '6' },
      { label: 'Mac Devices', value: '3' },
      { label: 'Shared Files', value: '1800+' },
      { label: 'Sync Time', value: '2min' },
    ];

    return (
      <PageTransition>
        <EnhancedLayout sections={post.sections || []} hero={hero} stats={stats}>
          <div className="enhanced-article-inner">
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('title')}
            </Link>

            <article className="enhanced-article-content">
            {post.coverImage && (
              <div className="relative w-full aspect-video overflow-hidden rounded-xl mb-8 max-w-3xl mx-auto">
                <img
                  src={post.coverImage}
                  alt={post.title[locale] || post.title.zh}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {post.audioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.4 }}
                className="mb-6 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 p-4 flex items-center gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm">🎙</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-0.5">播客导读</div>
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-1">
                    {locale === 'zh' ? '点击播放本文语音版' : locale === 'ja' ? 'この記事の音声版を聴く' : 'Listen to this article'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <AudioPlayer
                    src={`https://aiblog.fuluckai.com${post.audioUrl?.startsWith('/') ? '' : '/'}${post.audioUrl}`}
                    label={locale === 'ja' ? '▶ 再生' : locale === 'en' ? '▶ Play' : '▶ 播放'}
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="glass-card p-8 sm:p-10"
            >
              <MarkdownRenderer content={post.content} />
            </motion.div>

            {post.willComment && post.willComment[locale] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Will&apos;s Take</span>
                  <AudioPlayer src={getAudioUrl(`${post.slug}-will-comment.mp3`)} label={locale === 'ja' ? 'Will の声で聴く' : locale === 'en' ? 'Listen to Will' : '听 Will说'} />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{post.willComment[locale]}</p>
              </motion.div>
            )}

            <hr className="my-10 border-border" />

            <nav className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group flex flex-col gap-1 rounded-lg border p-4 transition-all hover:bg-muted/50"
                >
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ChevronLeft className="h-3 w-3" />
                    {t('prev_post')}
                  </span>
                  <span className="text-sm font-medium line-clamp-1 group-hover:text-brand-cyan">
                    {prevTitle}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group flex flex-col items-end gap-1 rounded-lg border p-4 transition-all hover:bg-muted/50"
                >
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {t('next_post')}
                    <ChevronRight className="h-3 w-3" />
                  </span>
                  <span className="text-sm font-medium line-clamp-1 group-hover:text-brand-cyan">
                    {nextTitle}
                  </span>
                </Link>
              )}
            </nav>

            <div className="mt-12">
              <CommentSection postSlug={postSlug ?? post.slug} />
            </div>
          </article>

          {/* Mobile Table of Contents */}
          <MobileTableOfContents headings={headings} />
        </div>
      </EnhancedLayout>
    </PageTransition>
    );
  }

  // Standard layout - original rendering for non-enhanced posts
  return (
    <PageTransition>
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('title')}
        </Link>

        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start xl:gap-12">
          <article className="min-w-0 max-w-4xl">
            {post.coverImage && (
              <div className="relative w-full aspect-video overflow-hidden rounded-xl mb-8 max-w-3xl mx-auto">
                <img
                  src={post.coverImage}
                  alt={post.title[locale] || post.title.zh}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {post.audioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.4 }}
                className="mb-6 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 p-4 flex items-center gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm">🎙</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-0.5">播客导读</div>
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-1">
                    {locale === 'zh' ? '点击播放本文语音版' : locale === 'ja' ? 'この記事の音声版を聴く' : 'Listen to this article'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <AudioPlayer
                    src={`https://aiblog.fuluckai.com${post.audioUrl?.startsWith('/') ? '' : '/'}${post.audioUrl}`}
                    label={locale === 'ja' ? '▶ 再生' : locale === 'en' ? '▶ Play' : '▶ 播放'}
                  />
                </div>
              </motion.div>
            )}
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 space-y-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                    CATEGORY_TAG_COLORS[post.category]
                  )}
                >
                  {t(CATEGORY_KEYS[post.category])}
                </span>
                <span
                  className={cn(
                    'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                    CONTENT_SOURCE_BADGE[post.contentSource]
                  )}
                >
                  {contentSourceLabel}
                </span>
              </div>

              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border/50 pt-4 mt-4">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString(
                      locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </time>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatReadingTime(post.readingTime, locale)}
                </span>
              </div>
            </motion.header>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="glass-card p-8 sm:p-10"
            >
              <MarkdownRenderer content={post.content} />
            </motion.div>

            {post.willComment && post.willComment[locale] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Will&apos;s Take</span>
                  <AudioPlayer src={getAudioUrl(`${post.slug}-will-comment.mp3`)} label={locale === 'ja' ? 'Willの声で聴く' : locale === 'en' ? 'Listen to Will' : '听 Will 说'} />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{post.willComment[locale]}</p>
              </motion.div>
            )}

            <hr className="my-10 border-border" />

            <nav className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group flex flex-col gap-1 rounded-lg border p-4 transition-all hover:bg-muted/50"
                >
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ChevronLeft className="h-3 w-3" />
                    {t('prev_post')}
                  </span>
                  <span className="text-sm font-medium line-clamp-1 group-hover:text-brand-cyan">
                    {prevTitle}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group flex flex-col items-end gap-1 rounded-lg border p-4 transition-all hover:bg-muted/50"
                >
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {t('next_post')}
                    <ChevronRight className="h-3 w-3" />
                  </span>
                  <span className="text-sm font-medium line-clamp-1 group-hover:text-brand-cyan">
                    {nextTitle}
                  </span>
                </Link>
              )}
            </nav>

            <div className="mt-12">
              <CommentSection postSlug={postSlug ?? post.slug} />
            </div>
          </article>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden xl:block xl:sticky xl:top-24"
          >
            <div className="space-y-4">
              <TableOfContents headings={headings} />
            </div>
          </motion.aside>
        </div>

        {/* Mobile Table of Contents */}
        <MobileTableOfContents headings={headings} />
      </div>
    </PageTransition>
  );
}
