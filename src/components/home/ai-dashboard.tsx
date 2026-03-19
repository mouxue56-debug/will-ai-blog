'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

interface AIInstance {
  name: string;
  nickname: string;
  role: string;
  status: 'online' | 'idle';
  tasks: number;
  color: string;
  dotColor: string;
}

const instances: AIInstance[] = [
  {
    name: 'ユキ',
    nickname: '小爪爪',
    role: '技术工程',
    status: 'online',
    tasks: 12,
    color: 'text-brand-cyan',
    dotColor: 'bg-brand-cyan',
  },
  {
    name: 'ナツ',
    nickname: '小触手',
    role: 'SNS运营',
    status: 'online',
    tasks: 8,
    color: 'text-brand-coral',
    dotColor: 'bg-brand-coral',
  },
  {
    name: 'ハル',
    nickname: '',
    role: '业务支持',
    status: 'online',
    tasks: 5,
    color: 'text-brand-mint',
    dotColor: 'bg-brand-mint',
  },
  {
    name: 'アキ',
    nickname: '',
    role: '移动助手',
    status: 'idle',
    tasks: 2,
    color: 'text-brand-mango',
    dotColor: 'bg-brand-mango',
  },
];

function StatusDot({ status, color }: { status: 'online' | 'idle'; color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === 'online' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-40`} />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color} ${status === 'idle' ? 'opacity-40' : ''}`} />
    </span>
  );
}

export function AIDashboard() {
  const t = useTranslations('home');
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {t('ai_dashboard_title')}
        </motion.h2>

        <motion.div
          className="relative rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
        >
          {/* Animated beam lines connecting instances */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-15"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4ADE80" stopOpacity="0" />
                <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Horizontal beams with flow animation */}
            <motion.line
              x1="10%" y1="30%" x2="90%" y2="30%"
              stroke="url(#beam-gradient)"
              strokeWidth="1"
              className="beam-flow"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.5, duration: 2, ease: 'easeInOut' }}
            />
            <motion.line
              x1="15%" y1="70%" x2="85%" y2="70%"
              stroke="url(#beam-gradient)"
              strokeWidth="1"
              className="beam-flow-reverse"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.8, duration: 2, ease: 'easeInOut' }}
            />
            {/* Diagonal beams with flow animation */}
            <motion.line
              x1="20%" y1="25%" x2="80%" y2="75%"
              stroke="url(#beam-gradient)"
              strokeWidth="0.5"
              className="beam-flow"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ delay: 1, duration: 2.5, ease: 'easeInOut' }}
            />
            <motion.line
              x1="80%" y1="25%" x2="20%" y2="75%"
              stroke="url(#beam-gradient)"
              strokeWidth="0.5"
              className="beam-flow-reverse"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ delay: 1.2, duration: 2.5, ease: 'easeInOut' }}
            />
          </svg>

          {/* Instances grid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {instances.map((inst, i) => (
              <motion.div
                key={inst.name}
                className="flex flex-col items-center gap-3 rounded-lg bg-background/60 dark:bg-background/30 p-4 border border-border/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
              >
                {/* Status dot */}
                <StatusDot status={inst.status} color={inst.dotColor} />

                {/* Name */}
                <div className="text-center">
                  <div className={`text-lg font-bold ${inst.color}`}>
                    {inst.name}
                  </div>
                  {inst.nickname && (
                    <div className="text-xs text-muted-foreground">{inst.nickname}</div>
                  )}
                </div>

                {/* Role */}
                <div className="text-xs text-muted-foreground">{inst.role}</div>

                {/* Tasks today */}
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">{t('ai_tasks_today')}</span>
                  <span className="font-semibold">{inst.tasks}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
