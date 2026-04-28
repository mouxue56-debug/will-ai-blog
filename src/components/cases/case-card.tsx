'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { CaseStudy } from '@/data/cases';
import { SpotlightCard } from '@/components/ui/aceternity';

import type { Locale } from '@/lib/locale';

export function CaseCard({ c, locale }: { c: CaseStudy; locale: Locale }) {
  const t = useTranslations('cases');
  const loc = locale;
  const highlightedMetrics = c.metrics;
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef(null);
  const [heroError, setHeroError] = useState(false);
  const heroSrc = `/covers/cases/${c.slug}.jpg`;

  return (
    <Link href={`/cases/${c.slug}`}>
      <motion.div
        ref={cardRef}
        whileHover={prefersReducedMotion ? {} : { y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <SpotlightCard className="p-0 glass-card border-white/[0.06] bg-card/80 dark:bg-white/[0.03] cursor-pointer overflow-hidden h-full">
          <div className="group flex h-full flex-col">
            <div
              className={`relative flex h-48 items-center justify-center overflow-hidden sm:h-56 ${heroError ? `bg-gradient-to-br ${c.gradient} opacity-90` : ''}`}
            >
              {!heroError && (
                <Image
                  src={heroSrc}
                  alt={c.title[loc]}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={() => setHeroError(true)}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              )}
              {heroError && (
                <>
                  <span className="text-7xl drop-shadow-lg select-none sm:text-8xl">{c.icon}</span>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
                </>
              )}
              <span className="absolute right-3 top-3 rounded-full bg-white/25 backdrop-blur-md px-2 py-0.5 text-2xl shadow-sm">{c.icon}</span>
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <div className="space-y-3">
                <h3 className="text-xl font-bold tracking-tight transition-colors group-hover:text-brand-mint">
                  {c.title[loc]}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{c.subtitle[loc]}</p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {highlightedMetrics.map((metric) => (
                  <div
                    key={`${metric.label[loc]}-${metric.value}`}
                    className="rounded-2xl border border-white/10 bg-background/55 px-3 py-3 backdrop-blur-sm"
                  >
                    <div className="text-lg font-bold text-foreground sm:text-xl">{metric.value}</div>
                    <div className="mt-1 text-[11px] leading-4 text-muted-foreground sm:text-xs">
                      {metric.label[loc]}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-brand-mint/20 bg-brand-mint/8 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-mint/90">
                  Key Lesson
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/88">{c.keyLesson[loc]}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {c.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-6 pt-1">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-mint transition-all group-hover:gap-2">
                  {t('view_details')}
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
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </motion.div>
    </Link>
  );
}
