'use client';

import { motion } from 'motion/react';
import { LampEffect } from '@/components/ui/aceternity';
import { FeedSection } from './feed-section';
import { useTranslations } from 'next-intl';

export function LatestUpdates() {
  const t = useTranslations('home');

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Lamp decoration */}
        <LampEffect color="cyan" className="min-h-[140px] -mb-8">
          <div />
        </LampEffect>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold">
            {t('feed_section_title')}
          </h2>
        </motion.div>
      </div>

      {/* Blog feed only — AI news moved to /debate page */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FeedSection hideTitle />
      </motion.div>
    </section>
  );
}
