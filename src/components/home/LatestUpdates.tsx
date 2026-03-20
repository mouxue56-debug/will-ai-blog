'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { LampEffect } from '@/components/ui/aceternity';
import { FeedSection } from './feed-section';
import { NewsSection } from './news-section';
import { useTranslations } from 'next-intl';

type Tab = 'blog' | 'news';

export function LatestUpdates() {
  const t = useTranslations('home');
  const [activeTab, setActiveTab] = useState<Tab>('blog');
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Lamp decoration */}
        <LampEffect color="cyan" className="min-h-[140px] -mb-8">
          <div />
        </LampEffect>

        {/* Section header with tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold">
            {t('feed_section_title')}
          </h2>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 p-1 rounded-full glass-card w-fit">
            <button
              onClick={() => setActiveTab('blog')}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                ${activeTab === 'blog'
                  ? 'bg-brand-mint/15 text-brand-mint shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {t('tab_blog')}
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                ${activeTab === 'news'
                  ? 'bg-brand-cyan/15 text-brand-cyan shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {t('tab_news')}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'blog' ? (
          <motion.div
            key="blog"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <FeedSection hideTitle />
          </motion.div>
        ) : (
          <motion.div
            key="news"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <NewsSection hideTitle />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
