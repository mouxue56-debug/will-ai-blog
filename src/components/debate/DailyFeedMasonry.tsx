'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

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
  title_zh?: string;
  title_ja?: string;
  title_en?: string;
  content: string;
  content_zh?: string;
  content_ja?: string;
  content_en?: string;
  topic_type: 'ai' | 'economy' | 'github';
  slug: string;
  author_emoji: string;
  published_at: string;
  newsItems?: NewsItem[];
  display_title_zh?: string;
  display_title_ja?: string;
  display_title_en?: string;
}

interface DailyFeedMasonryProps {
  topics: DailyTopic[];
}

const typeMeta: Record<string, { emoji: string; tint: string; textColor: string; label: { zh: string; ja: string; en: string } }> = {
  ai: {
    emoji: '🧠',
    tint: 'linear-gradient(135deg, rgba(180,142,224,0.42), rgba(120,100,200,0.20))',
    textColor: 'hsl(276 45% 28%)',
    label: { zh: 'AI 动态', ja: 'AIニュース', en: 'AI Pulse' },
  },
  economy: {
    emoji: '💹',
    tint: 'linear-gradient(135deg, rgba(92,201,167,0.42), rgba(76,170,140,0.20))',
    textColor: 'hsl(159 55% 22%)',
    label: { zh: '经济观察', ja: '経済', en: 'Economy' },
  },
  github: {
    emoji: '🔥',
    tint: 'linear-gradient(135deg, rgba(255,123,156,0.42), rgba(255,203,69,0.28))',
    textColor: 'hsl(338 60% 28%)',
    label: { zh: 'GitHub 热榜', ja: 'GitHub', en: 'GitHub Trending' },
  },
};

function parseNewsFromContent(content: string): NewsItem[] {
  const out: NewsItem[] = [];
  const regex = /- \[([^\]]+)\]\(([^)]+)\)\s*\*?—?\s*([^*\n]*)\*?/g;
  let m;
  while ((m = regex.exec(content)) !== null && out.length < 5) {
    out.push({
      title: m[1],
      url: m[2],
      source: (m[3] || '').trim().replace(/\*$/, '').trim(),
    });
  }
  return out;
}

function localizeTitle(item: NewsItem, locale: string): string {
  if (locale === 'ja' && item.title_ja) return item.title_ja;
  if (locale === 'en' && item.title_en) return item.title_en;
  if (locale === 'zh' && item.title_zh) return item.title_zh;
  return item.title_zh || item.title_en || item.title || '';
}

function localizeTopicTitle(topic: DailyTopic, locale: string): string {
  if (locale === 'ja') return topic.display_title_ja || topic.title_ja || topic.title;
  if (locale === 'en') return topic.display_title_en || topic.title_en || topic.title;
  return topic.display_title_zh || topic.title_zh || topic.title;
}

function formatDate(iso: string, locale: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'short' };
  const loc = locale === 'ja' ? 'ja-JP' : locale === 'en' ? 'en-US' : 'zh-CN';
  return d.toLocaleDateString(loc, opts);
}

export function DailyFeedMasonry({ topics }: DailyFeedMasonryProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'zh';
  const [opinionCounts, setOpinionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    const ids = topics.map((t) => t.id);
    Promise.all(
      ids.map((id) =>
        fetch(`/api/debate/opinion/${encodeURIComponent(id)}`)
          .then((r) => (r.ok ? r.json() : { opinions: [] }))
          .catch(() => ({ opinions: [] }))
          .then((d: { opinions?: unknown[] }) => [id, d.opinions?.length ?? 0] as const)
      )
    ).then((pairs) => {
      if (cancelled) return;
      setOpinionCounts(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [topics]);

  const grouped = useMemo(() => {
    const byDate = new Map<string, DailyTopic[]>();
    for (const t of topics) {
      const key = t.published_at ? t.published_at.slice(0, 10) : 'unknown';
      const list = byDate.get(key) ?? [];
      list.push(t);
      byDate.set(key, list);
    }
    return Array.from(byDate.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [topics]);

  if (!topics || topics.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          {locale === 'zh' && '还没有内容，明天早上见 🌙'}
          {locale === 'ja' && 'まだ話題がありません。明日の朝に 🌙'}
          {locale === 'en' && 'No topics yet — check back tomorrow 🌙'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
      {grouped.map(([date, list]) => (
        <section key={date} className="mb-10">
          {/* 日期分隔 */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-semibold tracking-wide text-foreground">
              {formatDate(list[0]?.published_at || date, locale)}
            </span>
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-xs text-muted-foreground">
              {list.length} {locale === 'zh' ? '条' : locale === 'ja' ? '件' : 'posts'}
            </span>
          </div>

          {/* 小红书瀑布流 (CSS columns) */}
          <div className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4 [column-fill:_balance]">
            {list.map((topic) => {
              const meta = typeMeta[topic.topic_type] ?? typeMeta.ai;
              const news =
                topic.newsItems && topic.newsItems.length > 0
                  ? topic.newsItems
                  : parseNewsFromContent(topic.content || '');
              const title = localizeTopicTitle(topic, locale);
              const count = opinionCounts[topic.id] ?? 0;

              return (
                <Link
                  key={topic.id}
                  href={`/${locale}/debate/${topic.id}`}
                  prefetch={false}
                  className="group mb-3 block break-inside-avoid glass-card overflow-hidden rounded-2xl sm:mb-4"
                >
                  {/* 彩色 tint header (小红书视觉锚) */}
                  <div
                    className="flex items-center gap-2 px-4 py-3"
                    style={{ background: meta.tint }}
                  >
                    <span className="text-lg">{meta.emoji}</span>
                    <span
                      className="text-[11.5px] font-bold tracking-wider uppercase dark:text-foreground/90"
                      style={{ color: meta.textColor }}
                    >
                      {meta.label[locale as 'zh' | 'ja' | 'en'] ?? meta.label.zh}
                    </span>
                  </div>

                  <div className="px-4 pt-3 pb-4">
                    <h3 className="text-[15px] font-semibold leading-snug text-foreground line-clamp-3 group-hover:text-foreground">
                      {title}
                    </h3>

                    {news.length > 0 && (
                      <ul className="mt-3 space-y-1.5 text-[12.5px] leading-snug text-muted-foreground">
                        {news.slice(0, 3).map((it, idx) => (
                          <li key={idx} className="line-clamp-2">
                            · {localizeTitle(it, locale)}
                          </li>
                        ))}
                        {news.length > 3 && (
                          <li className="text-[11px] opacity-70">
                            +{news.length - 3} {locale === 'zh' ? '条' : locale === 'ja' ? '件' : 'more'}
                          </li>
                        )}
                      </ul>
                    )}

                    <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" aria-hidden />
                        {count} {locale === 'zh' ? '评' : locale === 'ja' ? '意見' : 'views'}
                      </span>
                      <span className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                        {locale === 'zh' ? '展开 →' : locale === 'ja' ? '開く →' : 'Open →'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
