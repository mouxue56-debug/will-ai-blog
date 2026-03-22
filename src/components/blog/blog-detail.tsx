'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogPost, Comment, BlogCategory } from '@/lib/blog-types';
import { CATEGORY_KEYS } from '@/lib/blog-types';
import { Link } from '@/i18n/navigation';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { MarkdownRenderer } from './markdown-renderer';
import { TableOfContents, type TocHeading } from './table-of-contents';
import { MobileTableOfContents } from './mobile-table-of-contents';
import { CommentSection } from './comment-section';

const CATEGORY_TAG_COLORS: Record<BlogCategory, string> = {
  ai: 'bg-brand-cyan/15 text-brand-cyan',
  tech: 'bg-brand-mint/15 text-brand-mint',
  life: 'bg-brand-coral/15 text-brand-coral',
  cats: 'bg-brand-mango/15 text-brand-mango',
  business: 'bg-brand-taro/15 text-brand-taro',
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
            <motion.header
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
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

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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

              <hr className="border-border" />
            </motion.header>

            <ScrollReveal direction="fadeUp" delay={0.2} duration={0.6}>
              <div className="glass-card p-6 sm:p-8">
                <MarkdownRenderer content={post.content} />
              </div>
            </ScrollReveal>

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
              <CommentSection comments={comments} postSlug={postSlug} />
            </div>
          </article>

          <aside className="hidden xl:block">
            <TableOfContents headings={headings} />
          </aside>
        </div>

        {/* Mobile Table of Contents */}
        <MobileTableOfContents headings={headings} />
      </div>
    </PageTransition>
  );
}
