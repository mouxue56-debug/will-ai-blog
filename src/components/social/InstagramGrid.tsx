'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const mockPosts = [
  { key: 'cats', gradient: 'from-purple-300 via-pink-200 to-rose-300', emoji: '🐱' },
  { key: 'spring', gradient: 'from-amber-200 via-orange-200 to-yellow-200', emoji: '🌸' },
  { key: 'osaka', gradient: 'from-cyan-200 via-blue-200 to-indigo-200', emoji: '🏙️' },
  { key: 'nap', gradient: 'from-rose-200 via-pink-300 to-fuchsia-200', emoji: '🐾' },
  { key: 'plants', gradient: 'from-emerald-200 via-green-200 to-teal-200', emoji: '🍃' },
  { key: 'morning', gradient: 'from-violet-200 via-purple-200 to-fuchsia-200', emoji: '☀️' },
];

export function InstagramGrid() {
  const t = useTranslations('social');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="grid grid-cols-3 gap-2 sm:gap-3">
      {mockPosts.map((post, i) => (
        <motion.div
          key={post.key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
          className={`aspect-square rounded-lg bg-gradient-to-br ${post.gradient} flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-105 transition-transform duration-200 relative overflow-hidden group`}
        >
          <span className="text-2xl sm:text-3xl">{post.emoji}</span>
          <span className="text-[10px] sm:text-xs font-medium text-gray-700/80 text-center px-1 leading-tight">
            {t(`instagram_posts.${post.key}`)}
          </span>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        </motion.div>
      ))}
    </div>
  );
}
