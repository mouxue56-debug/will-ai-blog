'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { getDebateById } from '@/data/debates';
import { PageTransition } from '@/components/shared/PageTransition';
import { ArrowLeft } from 'lucide-react';

const stanceColors = {
  pro: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  con: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  neutral: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
};

const stanceIcons = { pro: '✅', con: '❌', neutral: '🤔' };

export default function DebateDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: rawLocale, id } = use(params);
  const locale = rawLocale as 'zh' | 'ja' | 'en';
  const t = useTranslations('debate');
  const debate = getDebateById(id);

  if (!debate) notFound();

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link
            href={`/${locale}/debate`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">{debate.date}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              debate.session === 'morning'
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-indigo-500/15 text-indigo-400'
            }`}>
              {t(debate.session)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-snug">
            🥊 {debate.topic[locale]}
          </h1>

          {/* News source */}
          <div className="glass-card px-4 py-3 text-sm text-muted-foreground italic">
            📰 {t('news_trigger')}: {debate.newsSource}
          </div>
        </motion.div>

        {/* AI Opinions */}
        <div className="flex flex-col gap-5">
          {debate.aiOpinions.map((op, i) => (
            <motion.div
              key={op.model}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
            >
              <div
                className="glass-card p-5 sm:p-6"
                style={{ borderColor: `${op.modelColor}30` }}
              >
                {/* Model name + stance */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full"
                    style={{
                      background: `${op.modelColor}20`,
                      color: op.modelColor,
                      border: `1px solid ${op.modelColor}50`,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: op.modelColor }} />
                    {op.model}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stanceColors[op.stance]}`}>
                    {stanceIcons[op.stance]} {t(op.stance)}
                  </span>
                </div>

                {/* Opinion text */}
                <p className="text-base leading-relaxed">{op.opinion[locale]}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex flex-wrap gap-2 mt-8"
        >
          {debate.tags.map((tag) => (
            <span key={tag} className="text-sm px-3 py-1 rounded-full bg-white/5 text-muted-foreground">
              #{tag}
            </span>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
}
