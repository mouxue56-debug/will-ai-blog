'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'motion/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import Image from 'next/image';

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

// Particle system for ambient effect
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

function useParticles(count: number) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#38bdf8', '#5eead4', '#c084fc', '#fbbf24', '#a78bfa'];
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5,
      });
    }
    setParticles(newParticles);
  }, [count]);

  return particles;
}

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

// Floating particles component
function FloatingParticles() {
  const particles = useParticles(20);
  
  return (
    <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}40`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration + 2,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Light beam component
function LightBeams() {
  return (
    <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
      {/* Diagonal beam 1 */}
      <motion.div
        className="absolute h-[2px] w-[200%] bg-gradient-to-r from-transparent via-brand-mint/30 to-transparent"
        style={{
          top: '20%',
          left: '-50%',
          transform: 'rotate(-15deg)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Diagonal beam 2 */}
      <motion.div
        className="absolute h-[1px] w-[200%] bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent"
        style={{
          top: '60%',
          left: '-50%',
          transform: 'rotate(10deg)',
        }}
        animate={{
          x: ['100%', '-100%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Horizontal beam */}
      <motion.div
        className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-brand-taro/20 to-transparent"
        style={{ top: '40%' }}
        animate={{
          x: ['-100%', '100%'],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 6,
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

function AINetwork() {
  const t = useTranslations('home');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getNodePos = useCallback(
    (idx: number) => ({
      x: (nodes[idx].x / 100) * 280 + 10,
      y: (nodes[idx].y / 100) * 240 + 10,
    }),
    []
  );

  return (
    <div className="relative mx-auto aspect-[300/260] w-full max-w-[300px]">
      {/* Glow effect behind the network */}
      <div className="absolute inset-0 bg-gradient-radial from-brand-mint/[0.05] via-transparent to-transparent blur-2xl" />
      
      <svg ref={svgRef} viewBox="0 0 300 260" className="h-full w-full relative z-10" fill="none">
        {/* Animated connection lines with flowing particles */}
        {connections.map((conn, i) => {
          const from = getNodePos(conn.from);
          const to = getNodePos(conn.to);
          return (
            <g key={`conn-${i}`}>
              {/* Base line */}
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(94,234,212,0.12)"
                strokeWidth="1"
              />
              {/* Animated flow line */}
              <motion.line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="url(#gradient-flow)"
                strokeWidth="2"
                strokeLinecap="round"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{
                  duration: 3,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </g>
          );
        })}

        {/* Gradient definition for flowing lines */}
        <defs>
          <linearGradient id="gradient-flow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#5eead4" stopOpacity="1" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Nodes */}
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
              {/* Outer glow ring */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 36 : 28}
                fill={`${node.color}08`}
                stroke={`${node.color}20`}
                strokeWidth="1"
                animate={{
                  opacity: isHovered ? [0.3, 0.5, 0.3] : [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Middle ring */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 20 : 16}
                fill={`${node.color}15`}
                stroke={`${node.color}40`}
                strokeWidth="1"
                animate={{
                  scale: isHovered ? [1, 1.1, 1] : [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Core node */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 14 : 11}
                fill={`${node.color}30`}
                stroke={node.color}
                strokeWidth="1.5"
                filter="url(#glow)"
                animate={{
                  boxShadow: isHovered 
                    ? `0 0 20px ${node.color}60`
                    : `0 0 10px ${node.color}40`,
                }}
                className="transition-all duration-300"
              />
              
              {/* Node label */}
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

              {/* Hover tooltip */}
              {isHovered && (
                <motion.g
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <rect
                    x={pos.x - 45}
                    y={pos.y - 42}
                    width="90"
                    height="22"
                    rx="6"
                    fill="rgba(10,10,15,0.9)"
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
                </motion.g>
              )}
            </g>
          );
        })}

        {/* Center hub */}
        <motion.circle
          cx="150"
          cy="130"
          r={8}
          fill="rgba(94,234,212,0.3)"
          stroke="#5eead4"
          strokeWidth="1"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <text x="150" y="131" textAnchor="middle" dominantBaseline="middle" fill="#5eead4" fontSize="6" fontWeight="700">
          W
        </text>

        {/* Dashed lines to center */}
        {nodes.map((_, i) => {
          const pos = getNodePos(i);
          return (
            <motion.line
              key={`center-${i}`}
              x1="150"
              y1="130"
              x2={pos.x}
              y2={pos.y}
              stroke="rgba(94,234,212,0.08)"
              strokeWidth="0.5"
              strokeDasharray="3,5"
              animate={{
                strokeDashoffset: [0, -16],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}
      </svg>
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
                  <span className="inline-flex items-center rounded-full border border-brand-mint/25 bg-brand-mint/[0.08] px-4 py-2 text-sm font-medium text-brand-mint transition-colors hover:bg-brand-mint/[0.14]">
                    {t('hero_cta_blog')}
                  </span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ delay: 0.3 }}>
                <Link href="/cases">
                  <span className="inline-flex items-center rounded-full border border-brand-taro/25 bg-brand-taro/[0.08] px-4 py-2 text-sm font-medium text-brand-taro transition-colors hover:bg-brand-taro/[0.14]">
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
              className="mt-8 flex items-center gap-6 sm:gap-10"
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
                    className="bg-gradient-to-r from-brand-mint to-brand-cyan bg-clip-text text-2xl font-bold text-transparent sm:text-3xl"
                    whileHover={{ scale: 1.1 }}
                  >
                    {stat.value}
                  </motion.span>
                  <span className="text-xs text-muted-foreground sm:text-sm">{stat.label}</span>
                </motion.div>
              ))}
              
              {/* Decorative dividers */}
              <div className="h-10 w-px bg-border" />
              <div className="h-10 w-px bg-border hidden sm:block" />
            </motion.div>
          </div>


        </div>
      </motion.div>
    </section>
  );
}
