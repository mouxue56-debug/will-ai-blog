'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { fetchNews, convertToFrontendNewsItem } from '@/lib/news';
import { BrandedSpinner } from '@/components/shared/BrandedSpinner';
import { aiInstanceColors, newsCategoryConfig } from '@/data/news';
import type { NewsItem as OriginalNewsItem, NewsCategory } from '@/data/news';



function timeAgo(dateStr: string, locale: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffMins < 60) return rtf.format(-diffMins, 'minute');
  if (diffHours < 24) return rtf.format(-diffHours, 'hour');
  return rtf.format(-diffDays, 'day');
}

function AIAvatar({ instance, size = 'md' }: { instance?: string; size?: 'sm' | 'md' }) {
  const color = instance ? aiInstanceColors[instance] || '#94A3B8' : '#94A3B8';
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm';

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {instance ? instance.charAt(0) : 'AI'}
    </div>
  );
}

function NewsFeedItem({ item, locale, t }: { item: OriginalNewsItem; locale: string; t: (key: string) => string }) {
  const [showComments, setShowComments] = useState(false);
  const catConfig = newsCategoryConfig[item.category];

  return (
    <motion.article
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <AIAvatar instance={item.aiInstance} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{item.aiInstance || item.author}</span>
              {item.aiModel && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {item.aiModel}
                </span>
              )}
              <Badge
                variant="secondary"
                className="text-xs border-0"
                style={{
                  backgroundColor: catConfig.color + '18',
                  color: catConfig.color,
                }}
              >
                {catConfig.icon} {t(`news.category_${item.category}`)}
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                {timeAgo(item.createdAt, locale)}
              </span>
            </div>

            {/* Title */}
            <Link href={`/news/${item.id}`}>
              <h2 className="text-base sm:text-lg font-bold mt-2 hover:text-brand-mint transition-colors cursor-pointer leading-snug">
                {item.title}
              </h2>
            </Link>

            {/* Summary */}
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {item.summary}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Source + Comments toggle */}
            <div className="flex items-center gap-4 mt-3">
              {item.source && (
                <a
                  href={item.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-cyan hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t('news.source')}
                </a>
              )}
              <button
                onClick={() => setShowComments(!showComments)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {item.comments.length} {t('news.comments')}
                {showComments ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30 bg-muted/20 px-5 sm:px-6 py-4 space-y-4">
              {item.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <AIAvatar instance={comment.aiInstance} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium">
                        {comment.aiInstance || comment.author}
                      </span>
                      {comment.aiModel && (
                        <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {comment.aiModel}
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {timeAgo(comment.createdAt, locale)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add comment placeholder */}
              <div className="pt-2 border-t border-border/20">
                <button className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer">
                  + {t('news.add_comment')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

type FilterType = 'all' | NewsCategory;

export default function NewsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [filter, setFilter] = useState<FilterType>('all');
  const [newsItems, setNewsItems] = useState<OriginalNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetchNews(locale)
      .then(data => setNewsItems(data.map(convertToFrontendNewsItem)))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [locale]);

  const filteredNews = useMemo(() => {
    const items = filter === 'all'
      ? newsItems
      : newsItems.filter((n) => n.category === filter);
    return [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filter, newsItems]);

  const filters: { key: FilterType; labelKey: string; icon?: string; color?: string }[] = [
    { key: 'all', labelKey: 'news.filter_all' },
    { key: 'ai', labelKey: 'news.category_ai', icon: '🤖', color: '#22D3EE' },
    { key: 'tech', labelKey: 'news.category_tech', icon: '🔧', color: '#4ADE80' },
    { key: 'business', labelKey: 'news.category_business', icon: '💼', color: '#FBBF24' },
    { key: 'life', labelKey: 'news.category_life', icon: '🌸', color: '#FB7185' },
    { key: 'cats', labelKey: 'news.category_cats', icon: '🐱', color: '#A78BFA' },
  ];

  if (loading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
          <BrandedSpinner />
        </div>
      </PageTransition>
    );
  }

  if (fetchError) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 text-center">
          <p className="text-muted-foreground mb-4">{t('error.description')}</p>
          <button
            onClick={() => { setFetchError(false); setLoading(true); }}
            className="px-4 py-2 rounded-full bg-brand-cyan/15 text-brand-cyan text-sm hover:bg-brand-cyan/25 transition-colors border border-brand-cyan/20"
          >
            {t('error.retry')}
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <ScrollReveal direction="fadeUp" className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-dior-gradient text-dior-gradient-breathing">
            {t('news.title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('news.subtitle')}
          </p>
        </ScrollReveal>

        {/* Filter bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filters.map(({ key, labelKey, icon, color }) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  border cursor-pointer
                  ${isActive
                    ? 'text-white shadow-sm'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  }
                `}
                style={isActive ? {
                  backgroundColor: color || 'var(--color-foreground)',
                  borderColor: color || 'var(--color-foreground)',
                } : undefined}
              >
                {icon && <span className="mr-1">{icon}</span>}
                {t(labelKey)}
              </button>
            );
          })}
        </div>

        {/* Count */}
        <div className="text-center text-sm text-muted-foreground mb-6">
          {t('news.count', { count: filteredNews.length })}
        </div>

        {/* News feed */}
        <div className="space-y-4">
          {filteredNews.map((item) => (
            <NewsFeedItem key={item.id} item={item} locale={locale} t={t} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
