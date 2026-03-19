'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const cats = [
  { name: 'ゆめ', breed: 'サイベリアン', age: '2歳', personality: '甘えん坊', gradient: 'from-pink-200 via-rose-200 to-purple-200', emoji: '🐱' },
  { name: 'そら', breed: 'サイベリアン', age: '1歳半', personality: 'やんちゃ', gradient: 'from-cyan-200 via-blue-200 to-indigo-200', emoji: '😺' },
  { name: 'もふ', breed: 'サイベリアン', age: '3歳', personality: 'おっとり', gradient: 'from-amber-200 via-orange-200 to-yellow-200', emoji: '😸' },
  { name: 'ひな', breed: 'サイベリアン', age: '8ヶ月', personality: '好奇心旺盛', gradient: 'from-emerald-200 via-green-200 to-teal-200', emoji: '😻' },
  { name: 'ふく', breed: 'サイベリアン', age: '4歳', personality: 'マイペース', gradient: 'from-violet-200 via-purple-200 to-fuchsia-200', emoji: '😽' },
];

export function CatShowcase() {
  const t = useTranslations('life');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🐱</span>
        <h2 className="text-lg sm:text-xl font-bold">{t('cat_showcase_title')}</h2>
      </div>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
        <div className="flex gap-4" style={{ width: 'max-content' }}>
          {cats.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              className="flex-shrink-0 w-[140px] sm:w-[160px] rounded-xl border border-border/40 bg-card/80 overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer"
            >
              {/* Cat avatar */}
              <div className={`bg-gradient-to-br ${cat.gradient} h-24 sm:h-28 flex items-center justify-center`}>
                <span className="text-3xl sm:text-4xl">{cat.emoji}</span>
              </div>
              {/* Info */}
              <div className="p-3">
                <h4 className="font-bold text-sm">{cat.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{cat.breed} · {cat.age}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-brand-mint/10 text-brand-mint text-[10px] font-medium">
                  {cat.personality}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
