'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { Play, Camera, Music } from 'lucide-react';
import { LampEffect } from '@/components/ui/aceternity';

const snsCards = [
  {
    key: 'youtube',
    href: '/social',
    icon: Play,
    label: 'YouTube',
    color: 'text-red-500',
    glowColor: 'rgba(239,68,68,0.15)',
    borderColor: 'border-red-500/20',
  },
  {
    key: 'instagram',
    href: '/social',
    icon: Camera,
    label: 'Instagram',
    color: 'text-fuchsia-500',
    glowColor: 'rgba(217,70,239,0.15)',
    borderColor: 'border-fuchsia-500/20',
  },
  {
    key: 'tiktok',
    href: '/social',
    icon: Music,
    label: 'TikTok',
    color: 'text-foreground',
    glowColor: 'rgba(255,255,255,0.08)',
    borderColor: 'border-border/40',
  },
];

export function MyWorld() {
  const t = useTranslations('home');
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <LampEffect color="purple" className="min-h-[140px] -mb-4">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            🌍 我的世界
          </motion.h2>
        </LampEffect>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: SNS cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-3 gap-3"
          >
            {snsCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.key} href={card.href}>
                  <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`glass-card flex flex-col items-center justify-center gap-3 p-6 sm:p-8 cursor-pointer ${card.borderColor}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}
                      style={{ background: card.glowColor }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">{card.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>

          {/* Right: Cattery compact banner */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="glass-card relative overflow-hidden h-full p-6 sm:p-8 flex flex-col justify-center">
              {/* Decorative */}
              <div className="absolute top-3 right-3 text-4xl opacity-15 select-none">🐱</div>
              <div className="absolute bottom-3 left-3 text-3xl opacity-10 select-none">🐾</div>

              <div className="relative z-10">
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  🐱 {t('cattery_title')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {t('cattery_desc')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-mint/15 text-brand-mint text-sm font-medium hover:bg-brand-mint/25 transition-colors"
                  >
                    {t('cattery_cta')} →
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-brand-mint/30 text-brand-mint text-sm font-medium hover:bg-brand-mint/10 transition-colors"
                  >
                    📱 Instagram
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
