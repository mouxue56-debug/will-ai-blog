'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { CaseStudy } from '@/data/cases';
import { CaseMarkdown } from './case-markdown';

type Locale = 'zh' | 'ja' | 'en';

/**
 * CountUp — extracts a number from a value string and animates from 0.
 * Keeps prefixes/suffixes intact (e.g., "95%" → animates 0→95, keeps "%").
 */
function CountUpValue({ value, inView }: { value: string; inView: boolean }) {
  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  const [displayNum, setDisplayNum] = useState(0);

  const prefix = match?.[1] ?? '';
  const target = match ? parseFloat(match[2]) : 0;
  const suffix = match?.[3] ?? '';
  const isFloat = match ? match[2].includes('.') : false;

  useEffect(() => {
    if (!inView || !match) return;
    const duration = 1200;
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNum(eased * target);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, match]);

  if (!match) return <>{value}</>;

  return (
    <>
      {prefix}
      {isFloat ? displayNum.toFixed(1) : Math.round(displayNum)}
      {suffix}
    </>
  );
}

function ExpandableSection({
  title,
  content,
  defaultOpen = false,
}: {
  title: string;
  content: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const prefersReducedMotion = useReducedMotion();

  if (defaultOpen) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <CaseMarkdown content={content} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary text-sm font-medium transition-colors"
      >
        <motion.svg
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </motion.svg>
        {title}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: prefersReducedMotion ? 0 : 0.25, 
              ease: [0.25, 0.1, 0.25, 1] 
            }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1">
              <CaseMarkdown content={content} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricsGrid({ metrics, locale }: { metrics: CaseStudy['metrics']; locale: Locale }) {
  const prefersReducedMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
    >
      {metrics.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          className="glass-card p-4 text-center space-y-1"
        >
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-brand-cyan to-brand-mint bg-clip-text text-transparent">
            <CountUpValue value={m.value} inView={inView && !prefersReducedMotion} />
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {m.label[locale]}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function CaseDetail({
  caseStudy,
  locale,
}: {
  caseStudy: CaseStudy;
  locale: string;
}) {
  const t = useTranslations('cases');
  const loc = locale as Locale;
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-16">
      {/* Hero section */}
      <div
        className={`relative -mx-4 sm:-mx-6 mb-10 overflow-hidden rounded-b-3xl bg-gradient-to-br ${caseStudy.gradient}`}
      >
        {/* Hero image (falls back to gradient if missing) */}
        <img
          src={`/covers/cases/${caseStudy.slug}.jpg`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80 dark:opacity-65"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative px-6 sm:px-10 py-14 sm:py-20 text-white">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-4"
          >
            <span className="text-6xl sm:text-7xl">{caseStudy.icon}</span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {caseStudy.title[loc]}
            </h1>
            <p className="text-lg sm:text-xl opacity-90">
              {caseStudy.subtitle[loc]}
            </p>

            {/* Tech stack */}
            <div className="flex flex-wrap gap-2 pt-2">
              {caseStudy.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-sm font-medium text-white"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Metrics with countUp */}
      <MetricsGrid metrics={caseStudy.metrics} locale={loc} />

      {/* Content layers */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-8"
      >
        {/* Story layer - always open */}
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <ExpandableSection
            title={`📖 ${t('story_layer')}`}
            content={caseStudy.story[loc]}
            defaultOpen
          />

          <div className="border-t border-border/40 pt-6">
            <ExpandableSection
              title={`🔧 ${t('tech_layer')}`}
              content={caseStudy.technical[loc]}
            />
          </div>

          <div className="border-t border-border/40 pt-6">
            <ExpandableSection
              title={`🔬 ${t('deep_layer')}`}
              content={caseStudy.deep[loc]}
            />
          </div>
        </div>
      </motion.div>

      {/* Back button */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.4 }}
        className="mt-10"
      >
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary text-sm font-medium transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          {t('back_to_cases')}
        </Link>
      </motion.div>
    </div>
  );
}
