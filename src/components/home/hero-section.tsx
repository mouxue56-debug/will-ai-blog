'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { TextGenerateEffect, ShimmerButton, LampEffect } from '@/components/ui/aceternity';
import { Link } from '@/i18n/navigation';

/* ── Typing effect hook ──────────────────────────────────── */
function useTypewriter(text: string, speed = 40, delay = 800) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayed, done };
}

/* ── Animated counter ────────────────────────────────────── */
function AnimatedCounter({ value, suffix = '', label }: { value: string; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value, 10);
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    if (!inView || !isNumeric) return;
    let frame: number;
    const duration = 1200;
    const start = performance.now();

    function animate(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * numericValue));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, numericValue, isNumeric]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-brand-mint to-brand-cyan bg-clip-text text-transparent">
        {isNumeric ? count : value}{suffix}
      </span>
      <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

/* ── AI Network node data ────────────────────────────────── */
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

/* ── AI Network SVG ──────────────────────────────────────── */
function AINetwork() {
  const t = useTranslations('home');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodePos = useCallback((idx: number) => ({
    x: (nodes[idx].x / 100) * 280 + 10,
    y: (nodes[idx].y / 100) * 240 + 10,
  }), []);

  return (
    <div className="relative w-full max-w-[300px] aspect-[300/260] mx-auto">
      <svg viewBox="0 0 300 260" className="w-full h-full" fill="none">
        {connections.map((conn, i) => {
          const from = getNodePos(conn.from);
          const to = getNodePos(conn.to);
          return (
            <g key={`conn-${i}`}>
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke="rgba(94,234,212,0.15)"
                strokeWidth="1"
              />
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke="url(#beamGradient)"
                strokeWidth="1.5"
                className={i % 2 === 0 ? 'beam-flow' : 'beam-flow-reverse'}
              />
            </g>
          );
        })}

        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(94,234,212,0.6)" />
            <stop offset="50%" stopColor="rgba(56,189,248,0.8)" />
            <stop offset="100%" stopColor="rgba(192,132,252,0.6)" />
          </linearGradient>
        </defs>

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
                cx={pos.x} cy={pos.y} r={isHovered ? 24 : 20}
                fill={`${node.color}10`}
                stroke={`${node.color}30`}
                strokeWidth="1"
                className="transition-all duration-300"
              />
              <circle
                cx={pos.x} cy={pos.y} r={isHovered ? 14 : 11}
                fill={`${node.color}20`}
                stroke={node.color}
                strokeWidth="1.5"
                className="transition-all duration-300"
                style={{
                  filter: isHovered ? `drop-shadow(0 0 10px ${node.color}80)` : `drop-shadow(0 0 4px ${node.color}40)`,
                }}
              />
              <text
                x={pos.x} y={pos.y + 1}
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
                    x={pos.x - 45} y={pos.y - 42}
                    width="90" height="22"
                    rx="6"
                    fill="rgba(10,10,15,0.85)"
                    stroke={`${node.color}40`}
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x} y={pos.y - 28}
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
        <text x="150" y="131" textAnchor="middle" dominantBaseline="middle" fill="#5eead4" fontSize="6" fontWeight="700">W</text>

        {nodes.map((_, i) => {
          const pos = getNodePos(i);
          return (
            <line
              key={`center-${i}`}
              x1={150} y1={130}
              x2={pos.x} y2={pos.y}
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

/* ── Hero Section ────────────────────────────────────────── */
export function HeroSection() {
  const t = useTranslations('home');
  const navT = useTranslations('nav');
  const subtitleText = t('hero_subtitle');
  const { displayed, done } = useTypewriter(subtitleText, 35, 1000);

  return (
    <section className="relative overflow-hidden px-4 sm:px-6 py-8 sm:py-16 lg:py-20">
      {/* LampEffect decoration at the top */}
      <div className="absolute inset-x-0 top-0 -z-5 pointer-events-none opacity-40 dark:opacity-60">
        <LampEffect color="cyan" className="min-h-[180px]">
          <div />
        </LampEffect>
      </div>

      {/* Ambient background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 dark:opacity-100 opacity-0 transition-opacity duration-500">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-mint/[0.06] rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-brand-cyan/[0.06] rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-brand-taro/[0.04] rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-mint/[0.12] rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-brand-cyan/[0.12] rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-brand-taro/[0.08] rounded-full blur-[100px]" />
        </div>

        {/* Particles */}
        <div className="particle bg-brand-mint/20 w-3 h-3 top-[15%] left-[10%]" style={{ '--dur': '18s', '--delay': '0s' } as React.CSSProperties} />
        <div className="particle bg-brand-cyan/25 w-5 h-5 top-[25%] right-[15%]" style={{ '--dur': '22s', '--delay': '2s' } as React.CSSProperties} />
        <div className="particle bg-brand-taro/15 w-4 h-4 bottom-[20%] left-[20%]" style={{ '--dur': '25s', '--delay': '4s' } as React.CSSProperties} />
        <div className="particle bg-brand-mint/10 w-2 h-2 top-[40%] right-[25%]" style={{ '--dur': '20s', '--delay': '1s' } as React.CSSProperties} />
      </div>

      <div className="mx-auto max-w-5xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left side: Content (60%) */}
          <div className="flex-1 lg:max-w-[60%] flex flex-col items-start text-left">
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-brand-mint/20 bg-brand-mint/[0.06] text-brand-mint mb-6"
              style={{
                boxShadow: '0 0 12px rgba(94,234,212,0.1), inset 0 0 12px rgba(94,234,212,0.05)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-mint animate-pulse" />
              {t('hero_badge')}
            </motion.div>

            {/* Main title — TextGenerateEffect */}
            <TextGenerateEffect
              words="Will's AI Lab"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-brand-mint via-brand-cyan to-brand-taro bg-clip-text text-transparent"
              delay={0.04}
            />

            {/* Subtitle — typewriter effect */}
            <div className="mt-4 text-lg sm:text-xl text-muted-foreground min-h-[2em]">
              <span>{displayed}</span>
              {!done && <span className="typing-cursor text-brand-mint ml-0.5">|</span>}
            </div>

            {/* Description */}
            <motion.p
              className="mt-4 text-base text-muted-foreground/80 leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5, ease: 'easeOut' }}
            >
              {t('hero_description')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="mt-6 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.5, ease: 'easeOut' }}
            >
              <Link href="/blog">
                <ShimmerButton
                  shimmerColor="rgba(94,234,212,0.3)"
                  background="rgba(94,234,212,0.12)"
                  className="border-brand-mint/20 text-brand-mint hover:shadow-[0_0_30px_6px_rgba(94,234,212,0.15)]"
                >
                  📝 {t('hero_cta_blog') || 'Read Blog'}
                </ShimmerButton>
              </Link>
              <Link href="/cases">
                <ShimmerButton
                  shimmerColor="rgba(192,132,252,0.3)"
                  background="rgba(192,132,252,0.08)"
                  className="border-brand-taro/20 text-brand-taro hover:shadow-[0_0_30px_6px_rgba(192,132,252,0.15)]"
                >
                  🚀 {t('hero_cta_cases') || 'View Cases'}
                </ShimmerButton>
              </Link>
            </motion.div>

            <motion.div
              className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.95, duration: 0.5, ease: 'easeOut' }}
            >
              <Link href="/blog" className="hover:text-brand-mint transition-colors">
                {navT('blog')}
              </Link>
              <Link href="/timeline" className="hover:text-brand-mint transition-colors">
                {navT('timeline')}
              </Link>
              <Link href="/about" className="hover:text-brand-mint transition-colors">
                {navT('about')}
              </Link>
            </motion.div>

            {/* Stats counters */}
            <motion.div
              className="mt-8 flex items-center gap-6 sm:gap-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.5, ease: 'easeOut' }}
            >
              <AnimatedCounter value="4" label={t('hero_stat_agents')} />
              <div className="w-px h-10 bg-border" />
              <AnimatedCounter value="5" suffix="+" label={t('hero_stat_platforms')} />
              <div className="w-px h-10 bg-border" />
              <AnimatedCounter value="2026" label={t('hero_stat_base')} />
            </motion.div>
          </div>

          {/* Right side: AI Network (40%) */}
          <motion.div
            className="w-full lg:w-[40%] flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          >
            <AINetwork />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
