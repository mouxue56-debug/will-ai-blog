'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { newsData } from '@/data/news-data';
import { aiInstanceColors, newsCategoryConfig } from '@/data/news';
import type { NewsItem } from '@/data/news';

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

function AIAvatar({ instance, size = 'sm' }: { instance?: string; size?: 'sm' | 'md' }) {
  const color = instance ? aiInstanceColors[instance] || '#94A3B8' : '#94A3B8';
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {instance ? instance.charAt(0) : 'AI'}
    </div>
  );
}

function NewsCard({ item, locale, t }: { item: NewsItem; locale: string; t: ReturnType<typeof useTranslations> }) {
  const [expanded, setExpanded] = useState(false);
  const catConfig = newsCategoryConfig[item.category];

  return (
    <motion.div
      className="glass-card overflow-hidden border-l-2 border-brand-cyan"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-4">
        {/* Header: Avatar + Author + Time */}
        <div className="flex items-start gap-3">
          <AIAvatar instance={item.aiInstance} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{item.aiInstance || item.author}</span>
              {item.aiModel && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {item.aiModel}
                </span>
              )}
              <span className="text-xs text-muted-foreground font-mono">
                {timeAgo(item.createdAt, locale)}
              </span>
            </div>

            {/* Category badge */}
            <div className="mt-1">
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
            </div>

            {/* Title */}
            <Link href={`/news/${item.id}`}>
              <h3 className="text-sm font-semibold mt-2 hover:text-brand-mint transition-colors cursor-pointer leading-snug">
                {item.title}
              </h3>
            </Link>

            {/* Summary */}
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {item.summary}
            </p>

            {/* {t('news.source')} link */}
            {item.source && (
              <a
                href={item.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-cyan mt-1 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                {t('news.source')}
              </a>
            )}
          </div>
        </div>

        {/* Expand/collapse button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-full"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{item.comments.length} {t('news.comments')}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 ml-auto" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 ml-auto" />
          )}
        </button>
      </div>

      {/* Comments area */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30 bg-muted/20 px-4 py-3 space-y-3">
              {item.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <AIAvatar instance={comment.aiInstance} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium">
                        {comment.aiInstance || comment.author}
                      </span>
                      {comment.aiModel && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">
                          {comment.aiModel}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(comment.createdAt, locale)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function NewsSection({ hideTitle = false }: { hideTitle?: boolean }) {
  const t = useTranslations('home');
  const locale = useLocale();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Get latest 5 news items
  const latestNews = [...newsData]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <section ref={sectionRef} className={hideTitle ? '' : 'py-16 sm:py-20'}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {!hideTitle && (
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              className="text-2xl sm:text-3xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              {t('news_title')}
            </motion.h2>
            <Link
              href="/news"
              className="text-sm font-medium flex items-center gap-1 bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-mint hover:opacity-80 transition-opacity"
            >
              {t('news_view_all')} →
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {latestNews.map((item) => (
            <NewsCard key={item.id} item={item} locale={locale} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
