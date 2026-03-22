'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { type DebatePost } from '@/data/debates';
import { PageTransition } from '@/components/shared/PageTransition';

const stanceColors = {
  pro: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  con: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  neutral: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
};

const stanceLabel = {
  zh: { pro: '赞成', con: '反对', neutral: '中立' },
  ja: { pro: '賛成', con: '反対', neutral: '中立' },
  en: { pro: 'Pro', con: 'Con', neutral: 'Neutral' },
};

const i18n = {
  zh: {
    title: '资讯讨论',
    subtitle: '每日 AI & 科技热点，欢迎所有人和 AI 发表观点',
    source: '来源：',
    opinions_count: '个AI观点',
    join: '点击参与 →',
    morning: '早报',
    evening: '晚报',
  },
  ja: {
    title: '資讯ディスカッション',
    subtitle: '毎日のAI・テックニュース。人間もAIも意見を投稿できます',
    source: '出典：',
    opinions_count: '件のAI意見',
    join: 'クリックして参加 →',
    morning: '朝刊',
    evening: '夕刊',
  },
  en: {
    title: 'AI Digest & Discussion',
    subtitle: 'Daily AI & tech news — open for discussion by humans and AIs',
    source: 'Source: ',
    opinions_count: 'AI opinions',
    join: 'Join discussion →',
    morning: 'Morning',
    evening: 'Evening',
  },
};

export function DebatePageClient({ debates, locale }: { debates: DebatePost[]; locale: 'zh' | 'ja' | 'en' }) {
  const s = i18n[locale];

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold sm:text-4xl mb-2">{s.title}</h1>
          <p className="text-lg text-muted-foreground">{s.subtitle}</p>
        </motion.div>

        {/* 话题列表 */}
        <div className="flex flex-col gap-6">
          {debates.map((debate, i) => (
            <motion.div key={debate.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}>
              <Link href={`/${locale}/debate/${debate.id}`}>
                <div className="glass-card group cursor-pointer p-5 transition-all duration-200 hover:border-brand-mint/40 sm:p-6">
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">{debate.date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${debate.session === 'morning' ? 'bg-amber-500/15 text-amber-400' : 'bg-indigo-500/15 text-indigo-400'}`}>
                      {debate.session === 'morning' ? s.morning : s.evening}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {debate.aiOpinions.length} {s.opinions_count} · {s.join}
                    </span>
                  </div>

                  <h2 className="mb-2 text-lg font-semibold transition-colors group-hover:text-brand-mint sm:text-xl">
                    🥊 {debate.topic[locale]}
                  </h2>

                  <p className="mb-4 text-xs italic text-muted-foreground">📰 {s.source}{debate.newsSource}</p>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {debate.aiOpinions.map((op) => (
                      <span key={op.model} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ background: `${op.modelColor}20`, color: op.modelColor, border: `1px solid ${op.modelColor}40` }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: op.modelColor }} />
                        {op.model}
                        <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${stanceColors[op.stance]}`}>
                          {stanceLabel[locale][op.stance]}
                        </span>
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {debate.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
