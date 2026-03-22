'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Bot, Sparkles, TrendingUp, Newspaper, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface NewsItem {
  title: string;
  url: string;
  source: string;
}

interface DailyTopic {
  id: string;
  title: string;
  content: string;
  topic_type: 'ai' | 'economy' | 'github';
  slug: string;
  author_emoji: string;
  published_at: string;
}

interface AIComment {
  id: string;
  content: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
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

// Fetch AI comments for a topic
async function fetchAIComments(slug: string): Promise<AIComment[]> {
  try {
    const response = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}&is_ai=true&limit=3`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.comments || [];
  } catch {
    return [];
  }
}

// Submit a comment
async function submitComment(slug: string, content: string): Promise<boolean> {
  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        content,
        author_name: '访客',
        is_ai: false,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function DailyTopicsAccordion({ topics }: DailyTopicsAccordionProps) {
  const t = useTranslations('debate');
  const params = useParams();
  const locale = (params?.locale as string) || 'zh';
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [comments, setComments] = useState<Record<string, AIComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  // Fetch comments when a topic is opened
  useEffect(() => {
    topics.forEach((topic, index) => {
      if (index === openIndex && !comments[topic.slug]) {
        fetchAIComments(topic.slug).then((data) => {
          setComments((prev) => ({ ...prev, [topic.slug]: data }));
        });
      }
    });
  }, [openIndex, topics, comments]);

  const handleToggle = (index: number) => {
    // If clicking already open item, do nothing (don't collapse)
    if (index === openIndex) return;
    setOpenIndex(index);
  };

  const handleSubmit = async (topic: DailyTopic) => {
    const content = commentInputs[topic.slug]?.trim();
    if (!content) return;

    setSubmitting((prev) => ({ ...prev, [topic.slug]: true }));
    const success = await submitComment(topic.slug, content);
    setSubmitting((prev) => ({ ...prev, [topic.slug]: false }));

    if (success) {
      setCommentInputs((prev) => ({ ...prev, [topic.slug]: '' }));
      // Refresh comments
      const newComments = await fetchAIComments(topic.slug);
      setComments((prev) => ({ ...prev, [topic.slug]: newComments }));
    }
  };

  if (!topics || topics.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#00D4FF] mb-2">{t('dailyTopics')}</h2>
          <p className="text-gray-400">{t('noContent')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#00D4FF] mb-2">{t('dailyTopics')}</h2>
        <p className="text-sm text-gray-400">{t('dailyTopicsSubtitle')}</p>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {topics.map((topic, index) => {
          const isOpen = index === openIndex;
          const Icon = topicIcons[topic.topic_type] || Newspaper;
          const newsItems = parseNewsItems(topic.content);
          const topicComments = comments[topic.slug] || [];
          const inputValue = commentInputs[topic.slug] || '';
          const isSubmitting = submitting[topic.slug] || false;

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'rgba(0, 212, 255, 0.05)',
                border: '1px solid rgba(0, 212, 255, 0.15)',
              }}
            >
              {/* Header */}
              <button
                onClick={() => handleToggle(index)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0, 212, 255, 0.1)' }}
                  >
                    <Icon className="w-5 h-5 text-[#00D4FF]" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">
                      {getTopicDisplayName(topic.topic_type, t)}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {topic.published_at ? topic.published_at.slice(0, 10) : ''} · {topic.published_at && new Date(topic.published_at).getHours() < 12 ? t('session_morning') : t('session_evening')}
                    </p>
                  </div>
                </div>

                {/* AI Avatars */}
                <div className="hidden sm:flex items-center -space-x-2 mr-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs border-2"
                      style={{
                        background: '#0D1825',
                        borderColor: 'rgba(0, 212, 255, 0.3)',
                      }}
                    >
                      {topic.author_emoji || '🤖'}
                    </div>
                  ))}
                </div>

                {/* Comment count badge */}
                <div
                  className="px-2.5 py-1 rounded-full text-xs flex-shrink-0"
                  style={{
                    background: 'rgba(255, 140, 66, 0.15)',
                    color: '#FF8C42',
                  }}
                >
                  {t('commentCount', { count: topicComments.length })}
                </div>

                {/* Arrow */}
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.span>
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
                    <div className="px-5 pb-5 pt-2">
                      {/* News Items */}
                      <div className="space-y-2 mb-4">
                        <p className="text-xs text-gray-400">
                          {t('news_intro')}
                        </p>
                        {newsItems.length > 0 ? (
                          newsItems.map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[#00D4FF] mt-1">•</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-gray-200 text-sm">{item.title}</span>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-xs px-2 py-0.5 rounded-full inline-block hover:opacity-80 transition-opacity"
                                  style={{
                                    background: 'rgba(0, 212, 255, 0.1)',
                                    color: '#00D4FF',
                                  }}
                                >
                                  来源：{item.source}
                                </a>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">{t('noContent')}</p>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full my-4" style={{ background: 'rgba(0, 212, 255, 0.1)' }} />

                      {/* AI Comments */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-[#FF8C42] mb-3 flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          {t('aiInsights')}
                        </h4>
                        <div className="space-y-3">
                          {topicComments.length > 0 ? (
                            topicComments.map((comment) => (
                              <div
                                key={comment.id}
                                className="p-3 rounded-lg"
                                style={{ background: 'rgba(0, 212, 255, 0.03)' }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                    style={{ background: 'rgba(255, 140, 66, 0.2)' }}
                                  >
                                    {topic.author_emoji || '🤖'}
                                  </div>
                                  <span className="text-xs text-gray-400">{comment.author_name}</span>
                                </div>
                                <p className="text-sm text-gray-300">{comment.content}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm italic">{t('noContent')}</p>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full my-4" style={{ background: 'rgba(0, 212, 255, 0.1)' }} />

                      {/* Comment Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [topic.slug]: e.target.value }))
                          }
                          placeholder={t('commentPlaceholder')}
                          className="flex-1 px-4 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none transition-all"
                          style={{
                            background: 'rgba(0, 212, 255, 0.05)',
                            border: '1px solid rgba(0, 212, 255, 0.2)',
                          }}
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
                          disabled={isSubmitting || !inputValue.trim()}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: '#00D4FF',
                            color: '#0D1825',
                          }}
                        >
                          {isSubmitting ? '...' : t('commentSubmit')}
                        </button>
                      </div>

                      {/* Link to debate detail page */}
                      <div className="flex justify-end mt-3">
                        <Link
                          href={`/${locale}/debate/${topic.id}`}
                          className="inline-flex items-center gap-1.5 text-xs text-[#00D4FF] hover:underline transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          查看完整讨论 →
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
  );
}
