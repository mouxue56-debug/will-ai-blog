'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { CaseStudy } from '@/data/cases';

type Locale = 'zh' | 'ja' | 'en';

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

  if (defaultOpen) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {content}
        </p>
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
          transition={{ duration: 0.2 }}
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-16">
      {/* Hero section */}
      <div
        className={`relative -mx-4 sm:-mx-6 mb-10 overflow-hidden rounded-b-3xl bg-gradient-to-br ${caseStudy.gradient}`}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative px-6 sm:px-10 py-14 sm:py-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
      >
        {caseStudy.metrics.map((m, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-card p-4 text-center space-y-1"
          >
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-brand-cyan to-brand-mint bg-clip-text text-transparent">
              {m.value}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {m.label[loc]}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Content layers */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="space-y-8"
      >
        {/* Story layer - always open */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 space-y-6">
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
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
