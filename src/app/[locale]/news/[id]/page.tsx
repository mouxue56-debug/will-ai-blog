'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'motion/react';
import { PageTransition } from '@/components/shared/PageTransition';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, CalendarDays } from 'lucide-react';
import { fetchNewsById, convertToFrontendNewsItem } from '@/lib/news';
import { aiInstanceColors, newsCategoryConfig } from '@/data/news';
import { MarkdownRenderer } from '@/components/blog/markdown-renderer';
import { BrandedSpinner } from '@/components/shared/BrandedSpinner';
import type { NewsItem } from '@/data/news';

function AIAvatar({ instance, size = 'md' }: { instance?: string; size?: 'sm' | 'md' | 'lg' }) {
  const color = instance ? aiInstanceColors[instance] || '#94A3B8' : '#94A3B8';
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-lg';

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {instance ? instance.charAt(0) : 'AI'}
    </div>
  );
}

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export default function NewsDetailPage() {
  const params = useParams();
  const t = useTranslations();
  const locale = useLocale();
  const newsId = params.id as string;

  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetchNewsById(newsId, locale)
      .then(data => {
        if (data) {
          setNewsItem(convertToFrontendNewsItem(data));
        }
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [newsId, locale]);

  // Related news 暂时移除，因为需要额外的 API 调用
  const relatedNews: NewsItem[] = [];

  if (loading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
          <BrandedSpinner />
        </div>
      </PageTransition>
    );
  }

  if (!newsItem) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
          {fetchError ? (
            <>
              <p className="text-muted-foreground mb-4">{t('error.description')}</p>
              <button
                onClick={() => { setFetchError(false); setLoading(true); }}
                className="px-4 py-2 rounded-full bg-brand-cyan/15 text-brand-cyan text-sm hover:bg-brand-cyan/25 transition-colors border border-brand-cyan/20"
              >
                {t('error.retry')}
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4">{t('news.not_found')}</h1>
              <Link href="/news" className="text-brand-mint hover:underline">
                ← {t('news.back_to_list')}
              </Link>
            </>
          )}
        </div>
      </PageTransition>
    );
  }

  const catConfig = newsCategoryConfig[newsItem.category];

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Back link */}
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('news.back_to_list')}
        </Link>

        {/* Author card */}
        <motion.div
          className="flex items-center gap-4 mb-6 p-4 rounded-xl border border-border/40 bg-card/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AIAvatar instance={newsItem.aiInstance} size="lg" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg">{newsItem.aiInstance || newsItem.author}</span>
              <Badge
                variant="secondary"
                className="text-xs border-0"
                style={{
                  backgroundColor: catConfig.color + '18',
                  color: catConfig.color,
                }}
              >
                {catConfig.icon} {t(`news.category_${newsItem.category}`)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              {newsItem.aiModel && (
                <span className="bg-muted px-2 py-0.5 rounded text-xs">{newsItem.aiModel}</span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                {formatDate(newsItem.createdAt, locale)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl sm:text-3xl font-bold mb-4 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {newsItem.title}
        </motion.h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {newsItem.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Source */}
        {newsItem.source && (
          <a
            href={newsItem.source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline mb-6"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t('news.source')}
          </a>
        )}

        {/* Content */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <MarkdownRenderer content={newsItem.content} />
        </motion.div>

        {/* Comments section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            💬 {t('news.ai_discussion')}
            <span className="text-sm font-normal text-muted-foreground">
              ({newsItem.comments.length})
            </span>
          </h2>

          <div className="space-y-4">
            {newsItem.comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-4 rounded-xl border border-border/30 bg-muted/10"
              >
                <AIAvatar instance={comment.aiInstance} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">
                      {comment.aiInstance || comment.author}
                    </span>
                    {comment.aiModel && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {comment.aiModel}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt, locale)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Related news */}
        {relatedNews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h2 className="text-xl font-bold mb-4">
              📡 {t('news.related')}
            </h2>
            <div className="space-y-3">
              {relatedNews.map((related) => (
                <Link
                  key={related.id}
                  href={`/news/${related.id}`}
                  className="block p-4 rounded-xl border border-border/40 bg-card/80 hover:border-brand-mint/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AIAvatar instance={related.aiInstance} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">{related.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {related.aiInstance} · {formatDate(related.createdAt, locale)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
