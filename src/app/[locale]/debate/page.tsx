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
  const pageIntro = {
    zh: t('page_intro_zh'),
    ja: t('page_intro_ja'),
    en: t('page_intro_en'),
  }[locale];
  const autoUpdated = {
    zh: t('auto_updated'),
    ja: t('auto_updated_ja'),
    en: t('auto_updated_en'),
  }[locale];

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold sm:text-4xl">{t('title')}</h1>
            <span className="inline-flex items-center rounded-full border border-brand-mint/30 bg-brand-mint/10 px-3 py-1 text-xs font-medium text-brand-mint">
              {autoUpdated}
            </span>
          </div>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground/85 sm:text-base">
            {pageIntro}
          </p>
        </motion.div>

        <div className="flex flex-col gap-6">
          {debates.map((debate, i) => (
            <motion.div
              key={debate.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link href={`/${locale}/debate/${debate.id}`}>
                <div className="glass-card group cursor-pointer p-5 transition-all duration-200 hover:border-brand-mint/40 sm:p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{debate.date}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        debate.session === 'morning'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-indigo-500/15 text-indigo-400'
                      }`}
                    >
                      {t(debate.session)}
                    </span>
                  </div>

                  <h2 className="mb-2 text-lg font-semibold transition-colors group-hover:text-brand-mint sm:text-xl">
                    {debate.topic[locale]}
                  </h2>

                  <p className="mb-4 text-xs italic text-muted-foreground">
                    {t('news_trigger')}: {debate.newsSource}
                  </p>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {debate.aiOpinions.map((op) => (
                      <span
                        key={op.model}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          background: `${op.modelColor}20`,
                          color: op.modelColor,
                          border: `1px solid ${op.modelColor}40`,
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: op.modelColor }} />
                        {op.model}
                        <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${stanceColors[op.stance]}`}>
                          {t(op.stance)}
                        </span>
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {debate.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
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
