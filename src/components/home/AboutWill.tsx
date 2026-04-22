'use client';

import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';

export function AboutWill() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      className="mx-auto max-w-5xl px-4 sm:px-6 py-10"
    >
      <div className="glass-card relative rounded-2xl p-6 sm:p-8 overflow-hidden">
        {/* 左侧渐变竖线装饰 */}
        <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-brand-cyan/80 via-brand-mint/60 to-transparent" />

        {/* 背景微光 */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-cyan/5 via-transparent to-brand-mint/5" />

        <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
          {/* 头像占位 */}
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-cyan/30 to-brand-mint/30 border border-brand-cyan/20 flex items-center justify-center text-3xl shadow-inner">
              🧑‍💻
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* 标题 */}
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-dior-gradient text-dior-gradient-breathing">
                关于这个博客 · About
              </h2>
              {/* 启动 badge */}
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-0.5 text-xs font-medium text-brand-cyan">
                📅 2026.3.22 正式启动
              </span>
            </div>

            {/* 副标题 */}
            <p className="text-sm text-muted-foreground mb-4">
              今天（2026年3月22日）是 Will 的 AI 博客正式启动的日子。
            </p>

            {/* 自我介绍 */}
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-5">
              我是 Will，在大阪生活的中国人，经营{' '}
              <span className="text-brand-cyan font-medium">サイベリアン｜大阪・福楽キャッテリー</span>
              。喜欢带孩子探索日本，热衷 AI 工具和自动化。日常工作由 4 个 AI 助手（ナツ / ユキ / ハル / アキ）协同管理。这个博客记录我的 AI 实践、猫舎日记与在日生活。
            </p>

            {/* 按钮 */}
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/25 px-5 py-2 text-sm font-medium text-brand-cyan hover:bg-brand-cyan/20 hover:border-brand-cyan/40 hover:shadow-[0_0_24px_-4px_rgba(0,212,255,0.35)] transition-all duration-300"
            >
              了解更多 <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
