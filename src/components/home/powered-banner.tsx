'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { ExternalLink } from 'lucide-react';

export function PoweredBanner() {
  const t = useTranslations('home');
  const bannerRef = useRef(null);
  const isInView = useInView(bannerRef, { once: true, margin: '-50px' });

  return (
    <section ref={bannerRef} className="py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.a
          href="https://fuluckai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-brand-mint/20 bg-brand-mint/5 px-6 py-4 text-sm sm:text-base text-brand-mint font-medium hover:bg-brand-mint/10 hover:border-brand-mint/30 transition-colors group"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span>{t('powered_banner')}</span>
          <ExternalLink className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
        </motion.a>
      </div>
    </section>
  );
}
