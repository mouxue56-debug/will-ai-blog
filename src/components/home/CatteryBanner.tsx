'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';

export function CatteryBanner() {
  const t = useTranslations('home');

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-5xl px-4 sm:px-6 py-8"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-mint/20 via-brand-cyan/15 to-brand-taro/20 dark:from-brand-mint/10 dark:via-brand-cyan/8 dark:to-brand-taro/10 border border-brand-mint/20 dark:border-brand-mint/10 p-6 sm:p-10">
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-4xl sm:text-6xl opacity-20 select-none">🐱</div>
        <div className="absolute bottom-4 left-4 text-3xl sm:text-5xl opacity-10 select-none">🐾</div>

        <div className="relative z-10 max-w-xl">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl sm:text-2xl font-bold"
          >
            🐱 {t('cattery_title')}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed"
          >
            {t('cattery_desc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-5 flex flex-wrap gap-3"
          >
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-mint text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-brand-mint/20"
            >
              {t('cattery_cta')} →
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-mint/40 text-brand-mint text-sm font-medium hover:bg-brand-mint/10 transition-colors"
            >
              📱 Instagram
            </a>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
