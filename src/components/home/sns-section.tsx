'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { Play, Camera, Music } from 'lucide-react';

interface SNSCard {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  hoverShadow: string;
  iconBg: string;
}

const snsCards: SNSCard[] = [
  {
    key: 'youtube',
    href: '/social',
    icon: Play,
    gradient: 'from-red-500/10 to-red-600/5 dark:from-red-500/15 dark:to-red-600/10',
    hoverShadow: 'hover:shadow-red-500/20',
    iconBg: 'bg-red-500/15 text-red-500',
  },
  {
    key: 'instagram',
    href: '/social',
    icon: Camera,
    gradient: 'from-fuchsia-500/10 via-purple-500/10 to-orange-400/10 dark:from-fuchsia-500/15 dark:via-purple-500/15 dark:to-orange-400/15',
    hoverShadow: 'hover:shadow-fuchsia-500/20',
    iconBg: 'bg-gradient-to-br from-fuchsia-500/20 to-orange-400/20 text-fuchsia-500',
  },
  {
    key: 'tiktok',
    href: '/social',
    icon: Music,
    gradient: 'from-gray-900/5 to-gray-800/5 dark:from-white/5 dark:to-white/3',
    hoverShadow: 'hover:shadow-gray-500/20 dark:hover:shadow-white/10',
    iconBg: 'bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white',
  },
];

export function SNSSection() {
  const t = useTranslations('home');
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const labelMap: Record<string, string> = {
    youtube: t('sns_youtube'),
    instagram: t('sns_instagram'),
    tiktok: t('sns_tiktok'),
  };

  return (
    <section ref={sectionRef} className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {t('sns_title')}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {snsCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
              >
                <Link href={card.href}>
                  <motion.div
                    className={`
                      relative flex flex-col items-center justify-center gap-4 
                      rounded-xl border border-border/40 bg-gradient-to-br ${card.gradient}
                      p-8 sm:p-10 cursor-pointer transition-shadow duration-300
                      ${card.hoverShadow} hover:shadow-lg
                    `}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${card.iconBg}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-base font-medium">
                      {labelMap[card.key]}
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
