'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Bot, Sparkles, TrendingUp, Newspaper, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface NewsItem {
  title?: string;
  title_en?: string;
  title_zh?: string;
  title_ja?: string;
  url: string;
  source: string;
}

interface DailyTopic {
  id: string;
  title: string;
  content: string;
  content_zh?: string;
  content_ja?: string;
  content_en?: string;
  topic_type: 'ai' | 'economy' | 'github';
  slug: string;
  author_emoji: string;
  published_at: string;
  newsItems?: NewsItem[];
}

interface Opinion {
  id: string;
  model: string;
  stance: string;
  opinion: { zh?: string; ja?: string; en?: string };
  instanceName?: string;
  createdAt: string;
  replies?: Opinion[];
}

interface DailyTopicsAccordionProps {
  topics: DailyTopic[];
}

const topicIcons = {
  ai: Sparkles,
  economy: TrendingUp,
  github: Bot,
};

function getTopicDisplayName(type: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    ai: `📡 ${t('topicAI')}`,
    economy: `💹 ${t('topicEconomy')}`,
    github: `🔥 ${t('topicGithub')}`,
  };
  return map[type] || type;
}

// Parse markdown content to extract news items
function parseNewsItems(content: string): NewsItem[] {
  const regex = /- \[([^\]]+)\]\(([^)]+)\) \*— ([^*]+)\*/g;
  const items: NewsItem[] = [];
  let match;
  while ((match = regex.exec(content)) !== null && items.length < 4) {
    items.push({
      title: match[1],
      url: match[2],
      source: match[3].trim(),
    });
  }
  return items;
}

// Fetch opinions for a topic
async function fetchOpinions(topicId: string): Promise<Opinion[]> {
  try {
    const response = await fetch(`/api/debate/opinion/${encodeURIComponent(topicId)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.opinions || [];
  } catch {
    return [];
  }
}

// Submit an opinion
async function submitOpinion(topicId: string, content: string, authorName: string, locale: string): Promise<{ ok: boolean; remaining?: number }> {
  try {
    const defaultName = locale === 'ja' ? 'ゲスト' : locale === 'en' ? 'Guest' : '访客';
    const response = await fetch('/api/debate/opinion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicId,
        model: authorName || defaultName,
        stance: 'neutral',
        opinion: { zh: content },
        isAI: false,
      }),
    });
    if (response.status === 429) return { ok: false, remaining: 0 };
    if (!response.ok) return { ok: false };
    const data = await response.json();
    return { ok: true, remaining: data.remaining };
  } catch {
    return { ok: false };
  }
}

export function DailyTopicsAccordion({ topics }: DailyTopicsAccordionProps) {
  const t = useTranslations('debate');
  const params = useParams();
  const locale = (params?.locale as string) || 'zh';
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [opinions, setOpinions] = useState<Record<string, Opinion[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [rateLimited, setRateLimited] = useState(false);

  // Preload opinion counts for all topics on mount
  useEffect(() => {
    topics.forEach((topic) => {
      if (!opinions[topic.id]) {
        fetchOpinions(topic.id).then((data) => {
          setOpinions((prev) => ({ ...prev, [topic.id]: data }));
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics]);

  const handleToggle = (index: number) => {
    setOpenIndex(index === openIndex ? -1 : index);
  };

  const handleSubmit = async (topic: DailyTopic) => {
    const content = commentInputs[topic.slug]?.trim();
    if (!content || content.length < 10) return;

    setSubmitting((prev) => ({ ...prev, [topic.slug]: true }));
    const result = await submitOpinion(topic.id, content, '', locale);
    setSubmitting((prev) => ({ ...prev, [topic.slug]: false }));

    if (result.remaining === 0) {
      setRateLimited(true);
    }

    if (result.ok) {
      setCommentInputs((prev) => ({ ...prev, [topic.slug]: '' }));
      const newOpinions = await fetchOpinions(topic.id);
      setOpinions((prev) => ({ ...prev, [topic.id]: newOpinions }));
    }
  };

  if (!topics || topics.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-cyan-600 dark:text-[#00D4FF] mb-2">{t('dailyTopics')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('noContent')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-cyan-600 dark:text-[#00D4FF] mb-2">{t('dailyTopics')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('dailyTopicsSubtitle')}</p>
      </div>

      {/* Group by date */}
      <div className="space-y-6">
        {Object.entries(
          topics.reduce<Record<string, { topics: typeof topics; indices: number[] }>>((groups, topic, index) => {
            const date = topic.published_at ? topic.published_at.slice(0, 10) : 'unknown';
            if (!groups[date]) groups[date] = { topics: [], indices: [] };
            groups[date].topics.push(topic);
            groups[date].indices.push(index);
            return groups;
          }, {})
        ).map(([date, { topics: dayTopics, indices }]) => (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1" style={{ background: 'rgba(0, 212, 255, 0.15)' }} />
              <span className="text-xs text-gray-400 font-medium">{date}</span>
              <div className="h-px flex-1" style={{ background: 'rgba(0, 212, 255, 0.15)' }} />
            </div>
            <div className="space-y-2">
        {dayTopics.map((topic, di) => {
          const index = indices[di];
          const isOpen = index === openIndex;
          const Icon = topicIcons[topic.topic_type] || Newspaper;
          // Use pre-parsed newsItems from API, fallback to parsing content
          const newsItems = topic.newsItems && topic.newsItems.length > 0 
            ? topic.newsItems 
            : parseNewsItems(topic.content);
          const topicOpinions = opinions[topic.id] || [];
          
          // Helper to get localized title from a news item
          const getLocalizedTitle = (item: NewsItem): string => {
            if (locale === 'ja' && item.title_ja) return item.title_ja;
            if (locale === 'en' && item.title_en) return item.title_en;
            if (locale === 'zh' && item.title_zh) return item.title_zh;
            return item.title_zh || item.title_en || item.title || '';
          };
          
          // Use first news headline as the display title
          const displayTitle = newsItems.length > 0 
            ? getLocalizedTitle(newsItems[0])
            : getTopicDisplayName(topic.topic_type, t);
          const inputValue = commentInputs[topic.slug] || '';
          const isSubmitting = submitting[topic.slug] || false;

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="rounded-xl overflow-hidden bg-cyan-50/50 dark:bg-[rgba(0,212,255,0.05)] border border-cyan-200/50 dark:border-[rgba(0,212,255,0.15)]"
            >
              {/* Card header - always visible */}
              <button
                onClick={() => handleToggle(index)}
                className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left"
              >
                {/* Top row: icon + category + date + comment count + arrow */}
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-600 dark:text-[#00D4FF] flex-shrink-0" />
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-600 dark:text-[#00D4FF]">
                    {getTopicDisplayName(topic.topic_type, t)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {topic.published_at ? topic.published_at.slice(0, 10) : ''}
                  </span>
                  <div
                    className="px-2 py-0.5 rounded-full text-xs ml-auto flex-shrink-0 bg-orange-50 dark:bg-[rgba(255,140,66,0.15)] text-orange-500 dark:text-[#FF8C42]"
                  >
                    {t('commentCount', { count: topicOpinions.length })}
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-500 dark:text-gray-400" />
                  </motion.span>
                </div>
                
                {/* News headlines preview - always visible */}
                <div className="space-y-1">
                  {newsItems.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-600 dark:text-[#00D4FF] text-xs mt-0.5 flex-shrink-0">•</span>
                      <span className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">{getLocalizedTitle(item)}</span>
                    </div>
                  ))}
                </div>
              </button>

              {/* Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1">
                      {/* News links with sources */}
                      <div className="space-y-1.5 mb-3">
                        {newsItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 hover:text-cyan-600 dark:text-[#00D4FF] transition-colors truncate"
                            >
                              {getLocalizedTitle(item)}
                            </a>
                            <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(0, 212, 255, 0.08)', color: 'rgba(0, 212, 255, 0.6)' }}>
                              {item.source}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full my-3" style={{ background: 'rgba(0, 212, 255, 0.1)' }} />

                      {/* AI Comments */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-[#FF8C42] mb-3 flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          {t('all_opinions')} ({topicOpinions.length})
                        </h4>
                        <div className="space-y-3">
                          {topicOpinions.length > 0 ? (
                            topicOpinions.map((op) => {
                              const opText = (locale === 'ja' ? op.opinion.ja : locale === 'en' ? op.opinion.en : op.opinion.zh) || op.opinion.zh || '';
                              return (
                                <div key={op.id}>
                                  <div
                                    className="p-3 rounded-lg"
                                    style={{ background: 'rgba(0, 212, 255, 0.03)' }}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                        style={{ background: op.stance === 'pro' ? 'rgba(34,197,94,0.2)' : op.stance === 'con' ? 'rgba(239,68,68,0.2)' : 'rgba(255, 140, 66, 0.2)' }}
                                      >
                                        {op.stance === 'pro' ? '👍' : op.stance === 'con' ? '👎' : '🤖'}
                                      </div>
                                      <span className="text-xs text-cyan-600 dark:text-[#00D4FF]">{op.model}</span>
                                      {op.instanceName && <span className="text-xs text-gray-500">({op.instanceName})</span>}
                                      <span className="text-xs text-gray-500 ml-auto">{new Date(op.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{opText}</p>
                                  </div>
                                  {/* Nested replies */}
                                  {op.replies && op.replies.length > 0 && (
                                    <div className="ml-6 mt-2 space-y-2 border-l-2 border-[rgba(0,212,255,0.1)] pl-3">
                                      {op.replies.map((reply) => {
                                        const replyText = (locale === 'ja' ? reply.opinion.ja : locale === 'en' ? reply.opinion.en : reply.opinion.zh) || reply.opinion.zh || '';
                                        return (
                                          <div key={reply.id} className="p-2 rounded-lg" style={{ background: 'rgba(0, 212, 255, 0.02)' }}>
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-xs text-[#FF8C42]">{reply.model}</span>
                                              <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{replyText}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-gray-500 text-sm italic">{t('live_empty')}</p>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full my-4" style={{ background: 'rgba(0, 212, 255, 0.1)' }} />

                      {/* Opinion Input */}
                      {rateLimited ? (
                        <p className="text-xs text-orange-400 text-center py-2">{t('rate_limited')}</p>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={inputValue}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [topic.slug]: e.target.value }))
                            }
                            placeholder={t('opinion_placeholder')}
                            className="flex-1 px-4 py-2 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all min-w-0 bg-gray-100 dark:bg-[rgba(0,212,255,0.05)] border border-cyan-200 dark:border-[rgba(0,212,255,0.2)]"
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#00D4FF';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(topic);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleSubmit(topic)}
                            disabled={isSubmitting || !inputValue.trim() || inputValue.trim().length < 10}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            style={{
                              background: '#00D4FF',
                              color: '#0D1825',
                            }}
                          >
                            {isSubmitting ? '...' : t('submit')}
                          </button>
                        </div>
                      )}

                      {/* Link to debate detail page */}
                      <div className="flex justify-end mt-3">
                        <Link
                          href={`/${locale}/debate/${topic.id}`}
                          className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-[#00D4FF] hover:underline transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          {t('view_full_discussion')}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
