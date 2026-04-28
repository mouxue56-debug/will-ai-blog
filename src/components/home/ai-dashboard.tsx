'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { SectionAccentLine } from '@/components/shared/SectionAccentLine';


interface AIInstance {
  key: string;
  nicknameKey?: string;
  status: 'online' | 'idle';
  tasks: number;
  color: string;
  dotColor: string;
  bgGradient: string;
}

const instances: AIInstance[] = [
  {
    key: 'yuki',
    nicknameKey: 'ai_instances.yuki.nickname',
    status: 'online',
    tasks: 12,
    color: 'text-brand-cyan',
    dotColor: 'bg-brand-cyan',
    bgGradient: 'from-brand-cyan/20 to-brand-mint/20',
  },
  {
    key: 'natsu',
    nicknameKey: 'ai_instances.natsu.nickname',
    status: 'online',
    tasks: 8,
    color: 'text-brand-coral',
    dotColor: 'bg-brand-coral',
    bgGradient: 'from-brand-coral/20 to-brand-mango/20',
  },
  {
    key: 'haru',
    status: 'online',
    tasks: 5,
    color: 'text-brand-mint',
    dotColor: 'bg-brand-mint',
    bgGradient: 'from-brand-mint/20 to-brand-taro/20',
  },
  {
    key: 'aki',
    status: 'idle',
    tasks: 2,
    color: 'text-brand-mango',
    dotColor: 'bg-brand-mango',
    bgGradient: 'from-brand-mango/20 to-brand-coral/20',
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

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionAccentLine />
        <motion.h2
          className="text-2xl sm:text-3xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5 }}
        >
          {t('ai_dashboard_title')}
        </motion.h2>

        <motion.div
          className="relative glass-card p-6 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
        >

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {instances.map((inst, i) => {
              const instanceName = t(`ai_instances.${inst.key}.name`);
              return (
              <motion.div
                key={inst.key}
                className="rounded-lg p-[1px] bg-gradient-to-r from-brand-cyan/30 via-brand-taro/20 to-brand-mint/30"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
              >
                <div className="flex flex-col items-center gap-3 rounded-lg bg-white/5 dark:bg-white/[0.03] p-4 backdrop-blur-sm h-full">
                  <StatusDot status={inst.status} color={inst.dotColor} />

                  <div className="text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 bg-gradient-to-br ${inst.bgGradient}`}
                    >
                      <span className={`text-sm font-bold ${inst.color}`}>
                        {instanceName.charAt(0)}
                      </span>
                    </div>
                    <div className={`text-lg font-bold ${inst.color}`}>
                      {instanceName}
                    </div>
                    {inst.nicknameKey ? (
                      <div className="text-xs text-muted-foreground">{t(inst.nicknameKey)}</div>
                    ) : null}
                  </div>

                  <div className="text-xs text-muted-foreground">{t(`ai_instances.${inst.key}.role`)}</div>

                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-muted-foreground">{t('ai_tasks_today')}</span>
                    <span className="font-semibold">{inst.tasks}</span>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
