'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('home');

  const titleWords = t('hero_title').split('');

  return (
    <section className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-20 sm:py-32 text-center overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 -z-10">
        {/* Light mode gradient */}
        <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-mint/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-brand-cyan/15 rounded-full blur-[100px] animate-pulse [animation-delay:1s]" />
          <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-brand-taro/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
        </div>
        {/* Dark mode gradient */}
        <div className="absolute inset-0 dark:opacity-100 opacity-0 transition-opacity duration-500">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-mint/8 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-brand-cyan/8 rounded-full blur-[100px] animate-pulse [animation-delay:1s]" />
          <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-brand-taro/6 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
        </div>

        {/* Floating particles — CSS only, no JS */}
        <div className="particle bg-brand-mint/20 w-3 h-3 top-[15%] left-[10%]" style={{ '--dur': '18s', '--delay': '0s' } as React.CSSProperties} />
        <div className="particle bg-brand-cyan/25 w-5 h-5 top-[25%] right-[15%]" style={{ '--dur': '22s', '--delay': '2s' } as React.CSSProperties} />
        <div className="particle bg-brand-taro/15 w-4 h-4 bottom-[20%] left-[20%]" style={{ '--dur': '25s', '--delay': '4s' } as React.CSSProperties} />
        <div className="particle bg-brand-mint/15 w-2 h-2 top-[40%] right-[25%]" style={{ '--dur': '20s', '--delay': '1s' } as React.CSSProperties} />
        <div className="particle bg-brand-cyan/20 w-6 h-6 bottom-[30%] right-[10%]" style={{ '--dur': '28s', '--delay': '3s' } as React.CSSProperties} />
        <div className="particle bg-brand-taro/20 w-3 h-3 top-[60%] left-[35%]" style={{ '--dur': '24s', '--delay': '5s' } as React.CSSProperties} />
        <div className="particle bg-brand-mint/10 w-4 h-4 top-[10%] left-[55%]" style={{ '--dur': '19s', '--delay': '6s' } as React.CSSProperties} />
      </div>

      {/* Title with staggered animation */}
      <motion.h1
        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.03,
            },
          },
        }}
      >
        <span className="bg-gradient-to-r from-brand-mint via-brand-cyan to-brand-taro bg-clip-text text-transparent inline-block">
          {titleWords.map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="mt-4 text-lg sm:text-xl text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
      >
        {t('hero_subtitle')}
      </motion.p>

      {/* Description */}
      <motion.p
        className="mt-4 max-w-2xl text-base text-muted-foreground/80 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
      >
        {t('hero_description')}
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5, ease: 'easeOut' }}
      >
        <Link href="/about">
          <Button size="lg" className="gap-2 bg-brand-mint text-gray-900 hover:bg-brand-mint/90">
            {t('cta_about')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/blog">
          <Button size="lg" variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            {t('cta_blog')}
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
