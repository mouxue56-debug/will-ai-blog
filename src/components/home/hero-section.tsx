'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { useState, useCallback } from 'react';
import { Link } from '@/i18n/navigation';

const nodes = [
  { id: 'yuki', color: '#38bdf8', x: 50, y: 20 },
  { id: 'natsu', color: '#5eead4', x: 85, y: 45 },
  { id: 'haru', color: '#c084fc', x: 50, y: 75 },
  { id: 'aki', color: '#fbbf24', x: 15, y: 45 },
];

const connections = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 0 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
];

function AINetwork() {
  const t = useTranslations('home');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodePos = useCallback(
    (idx: number) => ({
      x: (nodes[idx].x / 100) * 280 + 10,
      y: (nodes[idx].y / 100) * 240 + 10,
    }),
    []
  );

  return (
    <div className="relative mx-auto aspect-[300/260] w-full max-w-[300px]">
      <svg viewBox="0 0 300 260" className="h-full w-full" fill="none">
        {connections.map((conn, i) => {
          const from = getNodePos(conn.from);
          const to = getNodePos(conn.to);
          return (
            <g key={`conn-${i}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(94,234,212,0.18)"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {nodes.map((node, i) => {
          const pos = getNodePos(i);
          const isHovered = hoveredNode === node.id;
          return (
            <g
              key={node.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 24 : 20}
                fill={`${node.color}10`}
                stroke={`${node.color}30`}
                strokeWidth="1"
                className="transition-all duration-300"
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 14 : 11}
                fill={`${node.color}20`}
                stroke={node.color}
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={node.color}
                fontSize="9"
                fontWeight="600"
                className="select-none"
              >
                {t(`hero_nodes.${node.id}.name`)}
              </text>

              {isHovered && (
                <g>
                  <rect
                    x={pos.x - 45}
                    y={pos.y - 42}
                    width="90"
                    height="22"
                    rx="6"
                    fill="rgba(10,10,15,0.85)"
                    stroke={`${node.color}40`}
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 28}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#e4e4e7"
                    fontSize="8"
                  >
                    {t(`hero_nodes.${node.id}.name`)} · {t(`hero_nodes.${node.id}.role`)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        <circle cx="150" cy="130" r="6" fill="rgba(94,234,212,0.3)" stroke="#5eead4" strokeWidth="1" />
        <text x="150" y="131" textAnchor="middle" dominantBaseline="middle" fill="#5eead4" fontSize="6" fontWeight="700">
          W
        </text>

        {nodes.map((_, i) => {
          const pos = getNodePos(i);
          return (
            <line
              key={`center-${i}`}
              x1="150"
              y1="130"
              x2={pos.x}
              y2={pos.y}
              stroke="rgba(94,234,212,0.08)"
              strokeWidth="0.5"
              strokeDasharray="3,5"
            />
          );
        })}
      </svg>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations('home');
  const navT = useTranslations('nav');

  return (
    <section className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-16 lg:py-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-mint/[0.08] blur-[120px]" />
        <div className="absolute right-1/4 top-20 h-80 w-80 rounded-full bg-brand-cyan/[0.08] blur-[100px]" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-brand-taro/[0.06] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="flex flex-1 flex-col items-start text-left lg:max-w-[60%]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-mint/20 bg-brand-mint/[0.06] px-4 py-1.5 text-xs font-medium text-brand-mint"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-mint" />
              {t('hero_badge')}
            </motion.div>

            <motion.h1
              className="bg-gradient-to-r from-brand-mint via-brand-cyan to-brand-taro bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.45, ease: 'easeOut' }}
            >
              Will&apos;s AI Lab
            </motion.h1>

            <motion.p
              className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground/80 sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.45, ease: 'easeOut' }}
            >
              {t('hero_identity')}
            </motion.p>

            <motion.p
              className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.45, ease: 'easeOut' }}
            >
              {t('hero_subtitle')}
            </motion.p>

            <motion.p
              className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24, duration: 0.45, ease: 'easeOut' }}
            >
              {t('hero_description')}
            </motion.p>

            <motion.div
              className="mt-6 flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.45, ease: 'easeOut' }}
            >
              <Link href="/blog">
                <span className="inline-flex items-center rounded-full border border-brand-mint/25 bg-brand-mint/[0.08] px-4 py-2 text-sm font-medium text-brand-mint transition-colors hover:bg-brand-mint/[0.14]">
                  {t('hero_cta_blog')}
                </span>
              </Link>
              <Link href="/cases">
                <span className="inline-flex items-center rounded-full border border-brand-taro/25 bg-brand-taro/[0.08] px-4 py-2 text-sm font-medium text-brand-taro transition-colors hover:bg-brand-taro/[0.14]">
                  {t('hero_cta_cases')}
                </span>
              </Link>
            </motion.div>

            <motion.div
              className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.36, duration: 0.45, ease: 'easeOut' }}
            >
              <Link href="/blog" className="transition-colors hover:text-brand-mint">
                {navT('blog')}
              </Link>
              <Link href="/timeline" className="transition-colors hover:text-brand-mint">
                {navT('timeline')}
              </Link>
              <Link href="/about" className="transition-colors hover:text-brand-mint">
                {navT('about')}
              </Link>
            </motion.div>

            <motion.div
              className="mt-8 flex items-center gap-6 sm:gap-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.45, ease: 'easeOut' }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="bg-gradient-to-r from-brand-mint to-brand-cyan bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">4</span>
                <span className="text-xs text-muted-foreground sm:text-sm">{t('hero_stat_agents')}</span>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex flex-col items-center gap-1">
                <span className="bg-gradient-to-r from-brand-mint to-brand-cyan bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">5+</span>
                <span className="text-xs text-muted-foreground sm:text-sm">{t('hero_stat_platforms')}</span>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex flex-col items-center gap-1">
                <span className="bg-gradient-to-r from-brand-mint to-brand-cyan bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">Osaka</span>
                <span className="text-xs text-muted-foreground sm:text-sm">{t('hero_stat_base')}</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="w-full flex-shrink-0 lg:w-[40%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.5, ease: 'easeOut' }}
          >
            <AINetwork />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
