'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { AudioPlayer } from '@/components/shared/AudioPlayer';


// Animated gradient background
function AnimatedGradientBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Primary gradient orbs */}
      <motion.div
        className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-mint/[0.08] blur-[120px]"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute right-1/4 top-20 h-80 w-80 rounded-full bg-brand-cyan/[0.08] blur-[100px]"
        animate={{
          x: [0, -25, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-brand-taro/[0.06] blur-[100px]"
        animate={{
          x: [0, 40, 0],
          y: [0, -25, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Additional floating orbs */}
      <motion.div
        className="absolute left-1/2 top-1/3 h-64 w-64 rounded-full bg-brand-coral/[0.04] blur-[80px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute right-1/3 bottom-1/4 h-48 w-48 rounded-full bg-brand-cyan/[0.05] blur-[60px]"
        animate={{
          x: [0, -35, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// Glowing orb that follows mouse
function MouseFollowerOrb() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-brand-mint/[0.03] blur-[80px]"
        animate={{
          x: mousePosition.x - 128,
          y: mousePosition.y - 128,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 200,
        }}
      />
    </div>
  );
}

// Animated title with character-by-character reveal
function AnimatedTitle({ text }: { text: string }) {
  return (
    <motion.h1
      className="bg-gradient-to-r from-brand-mint via-brand-cyan to-brand-taro bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.1 + i * 0.03,
            duration: 0.3,
            ease: 'easeOut',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}

export function HeroSection() {
  const t = useTranslations('home');
  const navT = useTranslations('nav');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-16 lg:py-20">
      {/* Radial glow overlay — CSS only, no JS */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(0,212,255,0.12) 0%, transparent 70%)',
        }}
      />
      {/* Animated background layers */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0">
        <AnimatedGradientBackground />
      </motion.div>

      <MouseFollowerOrb />

      <motion.div style={{ opacity }} className="relative z-10 mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="flex flex-1 flex-col items-start text-left lg:max-w-[60%]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-mint/20 bg-brand-mint/[0.06] px-4 py-1.5 text-xs font-medium text-brand-mint"
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-brand-mint"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              {t('hero_badge')}
            </motion.div>

            <AnimatedTitle text="Will's AI Lab" />

            <motion.p
              className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground/80 sm:text-base"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
            >
              {t('hero_identity')}
            </motion.p>

            <motion.p
              className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: 'easeOut' }}
            >
              {t('hero_subtitle')}
            </motion.p>

            <motion.p
              className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground/80"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.45, ease: 'easeOut' }}
            >
              {t('hero_description')}
            </motion.p>

            <motion.div
              className="mt-6 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45, ease: 'easeOut' }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ delay: 0.3 }}>
                <Link href="/blog">
                  <span className="inline-flex items-center rounded-full border border-brand-mint/25 bg-brand-mint/[0.08] px-4 py-2 text-sm font-medium text-brand-mint transition-all duration-300 hover:bg-brand-mint/[0.14] hover:border-brand-mint/45 hover:shadow-[0_0_22px_-6px_rgba(125,211,192,0.45)]">
                    {t('hero_cta_blog')}
                  </span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ delay: 0.3 }}>
                <Link href="/cases">
                  <span className="inline-flex items-center rounded-full border border-brand-taro/25 bg-brand-taro/[0.08] px-4 py-2 text-sm font-medium text-brand-taro transition-all duration-300 hover:bg-brand-taro/[0.14] hover:border-brand-taro/45 hover:shadow-[0_0_22px_-6px_rgba(212,188,240,0.45)]">
                    {t('hero_cta_cases')}
                  </span>
                </Link>
              </motion.div>
              <AudioPlayer locale={locale} />
            </motion.div>

            <motion.div
              className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.45, ease: 'easeOut' }}
            >
              {['blog', 'timeline', 'about'].map((path, i) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
                >
                  <Link href={`/${path}`} className="transition-colors hover:text-brand-mint">
                    {navT(path as 'blog' | 'timeline' | 'about')}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-8 grid grid-cols-3 gap-x-4 gap-y-2 sm:gap-x-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.45, ease: 'easeOut' }}
            >
              {[
                { value: '4', label: t('hero_stat_agents') },
                { value: '5+', label: t('hero_stat_platforms') },
                { value: 'Osaka', label: t('hero_stat_base') },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="flex flex-col items-center gap-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.3, type: 'spring' }}
                >
                  <motion.span
                    className="bg-gradient-to-r from-brand-mint to-brand-cyan bg-clip-text text-xl font-bold text-transparent sm:text-3xl"
                    whileHover={{ scale: 1.1 }}
                  >
                    {stat.value}
                  </motion.span>
                  <span className="text-[11px] text-muted-foreground sm:text-sm">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>


        </div>
      </motion.div>
    </section>
  );
}
