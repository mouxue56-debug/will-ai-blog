'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import Link from 'next/link';
import { debates } from '@/data/debates';
import { PageTransition } from '@/components/shared/PageTransition';

const stanceColors = {
  pro: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  con: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  neutral: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
};

export default function DebatePage() {
  const t = useTranslations('debate');
  const locale = useLocale() as 'zh' | 'ja' | 'en';

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">🥊 {t('title')}</h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
        </motion.div>

        {/* Debate list */}
        <div className="flex flex-col gap-6">
          {debates.map((debate, i) => (
            <motion.div
              key={debate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link href={`/${locale}/debate/${debate.id}`}>
                <div className="glass-card p-5 sm:p-6 hover:border-brand-mint/40 transition-all duration-200 cursor-pointer group">
                  {/* Date + session */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted-foreground">{debate.date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      debate.session === 'morning'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-indigo-500/15 text-indigo-400'
                    }`}>
                      {t(debate.session)}
                    </span>
                  </div>

                  {/* Topic */}
                  <h2 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-brand-mint transition-colors">
                    {debate.topic[locale]}
                  </h2>

                  {/* News source */}
                  <p className="text-xs text-muted-foreground mb-4 italic">
                    📰 {t('news_trigger')}: {debate.newsSource}
                  </p>

                  {/* AI model badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {debate.aiOpinions.map((op) => (
                      <span
                        key={op.model}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: `${op.modelColor}20`,
                          color: op.modelColor,
                          border: `1px solid ${op.modelColor}40`,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: op.modelColor }} />
                        {op.model}
                        <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${stanceColors[op.stance]}`}>
                          {t(op.stance)}
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {debate.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                        #{tag}
                      </span>
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
