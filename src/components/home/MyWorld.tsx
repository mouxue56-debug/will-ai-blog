'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
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

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="w-16 h-0.5 bg-gradient-to-r from-[#00D4FF] to-transparent mb-6" />
        <LampEffect color="purple" className="min-h-[140px] -mb-4">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-dior-gradient text-dior-gradient-breathing"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            🌍 {t('my_world_title')}
          </motion.h2>
        </LampEffect>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-3 gap-2 sm:gap-3"
          >
            {snsCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.key} href={card.href}>
                  <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`glass-card flex flex-col items-center justify-center gap-2 p-4 sm:gap-3 sm:p-8 cursor-pointer bg-card/60 hover:bg-card/80 border border-white/[0.08] hover:border-brand-cyan/30 transition-all duration-300`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${card.color} hover:scale-110 transition-transform duration-300`}
                      style={{ background: card.glowColor }}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{card.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col gap-3 justify-center"
          >
            <a
              href="https://fuluck-cattery.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group glass-card p-5 flex items-center gap-4 hover:shadow-md border border-white/[0.08] hover:border-brand-cyan/30 bg-card/60 hover:bg-card/80 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-mint/10 flex items-center justify-center text-2xl flex-shrink-0 hover:scale-110 transition-transform duration-300">
                🐱
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-brand-mint transition-colors truncate">
                  {t('cattery_title')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                  {t('cattery_desc')}
                </p>
              </div>
              <span className="text-muted-foreground group-hover:text-brand-mint group-hover:translate-x-1 transition-all duration-200 flex-shrink-0">
                →
              </span>
            </a>

            <a
              href="https://fuluckai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group glass-card p-5 flex items-center gap-4 hover:shadow-md border border-white/[0.08] hover:border-brand-cyan/30 bg-card/60 hover:bg-card/80 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-mint/10 flex items-center justify-center text-2xl flex-shrink-0 hover:scale-110 transition-transform duration-300">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-brand-mint transition-colors truncate">
                  Fuluck AI
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                  AI × {t('cattery_title')}
                </p>
              </div>
              <span className="text-muted-foreground group-hover:text-brand-mint group-hover:translate-x-1 transition-all duration-200 flex-shrink-0">
                →
              </span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
