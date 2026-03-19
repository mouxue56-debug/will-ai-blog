'use client';

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { CaseStudy } from '@/data/cases';

type Locale = 'zh' | 'ja' | 'en';

export function CaseCard({ c, locale }: { c: CaseStudy; locale: string }) {
  const t = useTranslations('cases');
  const loc = locale as Locale;
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <Link href={`/cases/${c.slug}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card cursor-pointer"
      >
        {/* Spotlight effect */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-60 transition-opacity"
            style={{
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(74,222,128,0.12), transparent 60%)`,
            }}
          />
        )}

        {/* Gradient hero area */}
        <div
          className={`relative flex items-center justify-center h-48 sm:h-56 bg-gradient-to-br ${c.gradient} opacity-90`}
        >
          <span className="text-7xl sm:text-8xl drop-shadow-lg select-none">
            {c.icon}
          </span>
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-3">
          <h3 className="text-xl font-bold tracking-tight group-hover:text-brand-mint transition-colors">
            {c.title[loc]}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {c.subtitle[loc]}
          </p>

          {/* Tech stack pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {c.techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* View details CTA */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-mint group-hover:gap-2 transition-all">
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
      </motion.div>
    </Link>
  );
}
