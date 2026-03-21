'use client';

import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { Cat, Bot, Users, Newspaper, Zap } from 'lucide-react';
import { LampEffect } from '@/components/ui/aceternity';
import { useTranslations } from 'next-intl';

interface StoryNode {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
}

function StoryNodeCard({
  node,
  index,
}: {
  node: StoryNode;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isLeft = index % 2 === 0;

  return (
    <div
      ref={ref}
      className="relative flex w-full md:items-center"
    >
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, x: isLeft ? -30 : 30 }}
        animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className={`
          w-full
          md:w-[calc(50%-2.5rem)]
          ${isLeft ? 'md:mr-auto md:pr-6' : 'md:ml-auto md:pl-6'}
          pl-12 md:pl-0
        `}
      >
        <div className="glass-card p-5 sm:p-6">
          {/* Year tag */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${node.color} bg-current/[0.08] mb-3`}
            style={{
              backgroundColor: `${node.glowColor.replace('0.4', '0.1')}`,
            }}
          >
            {node.year}
          </span>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold mb-2">
            {node.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {node.description}
          </p>
        </div>
      </motion.div>

      {/* Center dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.2, type: 'spring', stiffness: 300 }}
        className={`
          absolute
          left-0 md:left-1/2 md:-translate-x-1/2
          top-6
          z-10
        `}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${node.color}`}
          style={{
            background: node.glowColor.replace('0.4', '0.15'),
            boxShadow: `0 0 16px ${node.glowColor}`,
            border: `2px solid ${node.glowColor.replace('0.4', '0.5')}`,
          }}
        >
          {node.icon}
        </div>
      </motion.div>
    </div>
  );
}

export function StoryTimeline() {
  const t = useTranslations('home');
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.8], ['0%', '100%']);

  // 按时间倒序排列：2026 → 2025 → 2024 → 2023 → 2022
  const storyNodes: StoryNode[] = [
    { year: t('story_node1_year'), title: t('story_node1_title'), description: t('story_node1_desc'), icon: <Cat className="h-5 w-5" />, color: 'text-brand-coral', glowColor: 'rgba(251,191,36,0.4)' },
    { year: t('story_node2_year'), title: t('story_node2_title'), description: t('story_node2_desc'), icon: <Bot className="h-5 w-5" />, color: 'text-brand-cyan', glowColor: 'rgba(56,189,248,0.4)' },
    { year: t('story_node3_year'), title: t('story_node3_title'), description: t('story_node3_desc'), icon: <Users className="h-5 w-5" />, color: 'text-brand-taro', glowColor: 'rgba(192,132,252,0.4)' },
    { year: t('story_node5_year'), title: t('story_node5_title'), description: t('story_node5_desc'), icon: <Bot className="h-5 w-5" />, color: 'text-brand-blueberry', glowColor: 'rgba(139,92,246,0.4)' },
    { year: t('story_node6_year'), title: t('story_node6_title'), description: t('story_node6_desc'), icon: <Zap className="h-5 w-5" />, color: 'text-brand-mango', glowColor: 'rgba(251,191,36,0.4)' },
    { year: t('story_node4_year'), title: t('story_node4_title'), description: t('story_node4_desc'), icon: <Newspaper className="h-5 w-5" />, color: 'text-brand-mint', glowColor: 'rgba(94,234,212,0.4)' },
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section title with Lamp */}
        <LampEffect color="green" className="min-h-[160px] mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold">
              📖 {t('story_section_title')}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t('story_section_subtitle')}
            </p>
          </motion.div>
        </LampEffect>

        {/* Timeline container */}
        <div ref={containerRef} className="relative">
          {/* Center line — static background */}
          <div className="absolute left-[19px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border/40" />

          {/* Center line — animated progress overlay */}
          <motion.div
            className="absolute left-[19px] md:left-1/2 md:-translate-x-px top-0 w-0.5"
            style={{
              height: lineHeight,
              background: 'linear-gradient(180deg, #5eead4, #38bdf8, #c084fc)',
            }}
          />

          {/* Story nodes */}
          <div className="flex flex-col gap-10 sm:gap-14">
            {storyNodes.map((node, i) => (
              <StoryNodeCard key={i} node={node} index={i} />
            ))}
          </div>

          {/* End dot */}
          <div className="absolute left-[15px] md:left-1/2 md:-translate-x-1/2 bottom-0 w-3 h-3 rounded-full bg-brand-mint shadow-[0_0_8px_rgba(94,234,212,0.5)]" />
        </div>
      </div>
    </section>
  );
}
