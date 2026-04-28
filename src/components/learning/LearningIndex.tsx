'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { BookOpen, Clock, Calendar } from 'lucide-react';

import type { Locale } from '@/lib/locale';

interface IndexPost {
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  date: string;
  readingTime: number;
  tags: string[];
}

interface Bucket {
  id: string;
  label: { zh: string; ja: string; en: string };
  match: (p: IndexPost) => boolean;
  accent: string;
}

const BUCKETS: Bucket[] = [
  {
    id: 'all',
    label: { zh: '全部', ja: 'すべて', en: 'All' },
    match: () => true,
    accent: '#9EC7E8',
  },
  {
    id: 'agent',
    label: { zh: 'AI Agent / 多智能体', ja: 'AIエージェント', en: 'AI Agents' },
    match: (p) =>
      hasAnyTag(p, ['agent', 'swarm', 'multi-agent', 'hermes-agent', 'orchestration', '多模型协作', '蜂群系统', 'skill']) ||
      hasAnyTitle(p, ['agent', 'swarm', '蜂群', '多模型', 'hermes', 'openclaw']),
    accent: '#B48EE0',
  },
  {
    id: 'memory',
    label: { zh: '记忆 / 知识库', ja: '記憶・ナレッジ', en: 'Memory & Knowledge' },
    match: (p) =>
      hasAnyTag(p, ['memory', 'knowledge-management', 'AI记忆', '长期记忆', 'memory-lancedb-pro', 'LanceDB']),
    accent: '#5CC9A7',
  },
  {
    id: 'voice',
    label: { zh: 'TTS / 语音视觉', ja: 'TTS・音声視覚', en: 'TTS / Voice & Vision' },
    match: (p) =>
      hasAnyTag(p, ['TTS', 'whisper', 'MLX', '语音合成', 'Apple Silicon', '图像生成', '图片生成', '视频生成']) ||
      hasAnyTitle(p, ['tts', 'whisper', 'mlx', 'minimax', '语音', '图片']),
    accent: '#FFCB45',
  },
  {
    id: 'pipeline',
    label: { zh: '自动化 / Pipeline', ja: '自動化・パイプライン', en: 'Pipelines' },
    match: (p) =>
      hasAnyTag(p, ['automation', 'pipeline', 'content', '自动生成', 'AI自动化']),
    accent: '#FF7B9C',
  },
  {
    id: 'bench',
    label: { zh: '模型评测', ja: 'モデル評価', en: 'Benchmarks' },
    match: (p) =>
      hasAnyTitle(p, ['benchmark', 'round', '评测', 'ranking', '排行']),
    accent: '#9EC7E8',
  },
  {
    id: 'eng',
    label: { zh: '工程实践', ja: 'エンジニアリング', en: 'Engineering' },
    match: (p) =>
      hasAnyTag(p, ['engineering', 'architecture', 'harness-engineering', '工程实践', 'browser-automation', 'web-scraping']) ||
      hasAnyTitle(p, ['architecture', '架构', 'openclaw', 'macbook', 'browser']),
    accent: '#66CFE0',
  },
];

function hasAnyTag(p: IndexPost, needles: string[]): boolean {
  if (!p.tags || p.tags.length === 0) return false;
  const lower = p.tags.map((t) => t.toLowerCase());
  return needles.some((n) => lower.some((t) => t.includes(n.toLowerCase())));
}

function hasAnyTitle(p: IndexPost, needles: string[]): boolean {
  const combined = Object.values(p.title || {}).join(' ').toLowerCase();
  return needles.some((n) => combined.includes(n.toLowerCase()));
}

function pickLocalized(obj: Record<string, string>, locale: Locale): string {
  return obj[locale] || obj.zh || obj.en || '';
}

export function LearningIndex({
  posts,
  locale,
  minReadLabel,
}: {
  posts: IndexPost[];
  locale: Locale;
  minReadLabel: string;
}) {
  const [active, setActive] = useState<string>('all');

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of BUCKETS) {
      map[b.id] = posts.filter(b.match).length;
    }
    return map;
  }, [posts]);

  const filtered = useMemo(() => {
    const bucket = BUCKETS.find((b) => b.id === active) ?? BUCKETS[0];
    return posts.filter(bucket.match);
  }, [posts, active]);

  return (
    <div className="mx-auto max-w-4xl px-4">
      {/* Sub-menu pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {BUCKETS.map((b) => {
          const isActive = b.id === active;
          const count = counts[b.id] ?? 0;
          if (count === 0 && b.id !== 'all') return null;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setActive(b.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'text-white border-transparent'
                  : 'glass-pill text-foreground/75 hover:text-foreground'
              }`}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${b.accent} 0%, rgba(0,0,0,0.2) 160%)`,
                      boxShadow: `0 2px 14px ${b.accent}66`,
                    }
                  : undefined
              }
            >
              <span>{b.label[locale]}</span>
              <span className={`text-[11px] ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Post list */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="glass-card mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <BookOpen className="h-7 w-7 text-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">
            {locale === 'zh' ? '暂无该类笔记' : locale === 'ja' ? 'このカテゴリの記事はまだありません' : 'No posts in this bucket yet'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((post) => {
            const title = pickLocalized(post.title, locale);
            const excerpt = pickLocalized(post.excerpt, locale);
            return (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <article className="k2w-card glass-card relative rounded-2xl p-6 transition-all duration-300">
                  <div
                    className="absolute inset-x-0 top-0 h-[1px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,123,156,0.55), transparent)' }}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
                    <div className="hidden sm:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-dior-pink/10 border border-dior-pink/25 dark:bg-cyan-500/10 dark:border-cyan-500/20">
                      <BookOpen className="h-5 w-5 text-dior-pink dark:text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="mb-2 text-lg font-semibold text-foreground group-hover:text-dior-pink dark:group-hover:text-cyan-300 transition-colors duration-200 leading-snug">
                        {title}
                      </h2>
                      {excerpt && (
                        <p className="mb-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">{excerpt}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        {post.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {post.date}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime} {minReadLabel}
                        </span>
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
