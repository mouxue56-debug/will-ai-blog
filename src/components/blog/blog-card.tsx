'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogPost, BlogCategory } from '@/lib/blog-types';
import { CATEGORY_KEYS } from '@/lib/blog-types';
import { Link } from '@/i18n/navigation';

const CATEGORY_TAG_COLORS: Record<BlogCategory, string> = {
  ai: 'bg-brand-cyan/15 text-brand-cyan shadow-[0_0_8px_rgba(56,189,248,0.15)]',
  tech: 'bg-brand-mint/15 text-brand-mint shadow-[0_0_8px_rgba(94,234,212,0.15)]',
  life: 'bg-brand-coral/15 text-brand-coral shadow-[0_0_8px_rgba(251,191,36,0.15)]',
  cats: 'bg-brand-mango/15 text-brand-mango shadow-[0_0_8px_rgba(252,211,77,0.15)]',
  business: 'bg-brand-taro/15 text-brand-taro shadow-[0_0_8px_rgba(192,132,252,0.15)]',
};

const COVER_GRADIENTS: Record<BlogCategory, string> = {
  ai: 'from-brand-cyan/20 to-brand-cyan/5',
  tech: 'from-brand-mint/20 to-brand-mint/5',
  life: 'from-brand-coral/20 to-brand-coral/5',
  cats: 'from-brand-mango/20 to-brand-mango/5',
  business: 'from-brand-taro/20 to-brand-taro/5',
};

const COVER_ICONS: Record<BlogCategory, string> = {
  ai: '🤖',
  tech: '⚙️',
  life: '🌸',
  cats: '🐱',
  business: '💼',
};

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const locale = useLocale();
  const t = useTranslations('blog');
  const title = post.title[locale] || post.title.zh || post.title.en || '';
  const excerpt = post.excerpt[locale] || post.excerpt.zh || post.excerpt.en || '';

  return (
    <div>
      <Link href={`/blog/${post.slug}`}>
        <article className="group relative flex flex-col overflow-hidden glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5">
          {/* Cover Image Placeholder */}
          <div
            className={cn(
              'relative flex h-40 items-center justify-center bg-gradient-to-br',
              COVER_GRADIENTS[post.category]
            )}
          >
            <span className="text-5xl opacity-60 transition-transform duration-300 group-hover:scale-110">
              {COVER_ICONS[post.category]}
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-3 p-4">
            {/* Category + Reading Time */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                  CATEGORY_TAG_COLORS[post.category]
                )}
              >
                {t(CATEGORY_KEYS[post.category])}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {post.readingTime} {t('min_read')}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold leading-snug line-clamp-2 transition-colors group-hover:text-brand-cyan">
              {title}
            </h2>

            {/* Excerpt */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {excerpt}
            </p>

            {/* Date */}
            <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span className="ml-auto text-muted-foreground/60">by {post.author}</span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
