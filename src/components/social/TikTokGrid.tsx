'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const mockVideos = [
  { key: 'morning', gradient: 'from-gray-800 via-gray-700 to-gray-900', emoji: '🐱', likes: '5.2K', views: '28K' },
  { key: 'ai', gradient: 'from-gray-900 via-gray-800 to-black', emoji: '🤖', likes: '3.8K', views: '19K' },
  { key: 'food', gradient: 'from-gray-700 via-gray-800 to-gray-900', emoji: '🍢', likes: '7.1K', views: '42K' },
];

export function TikTokGrid() {
  const t = useTranslations('social');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div className="grid grid-cols-3 gap-3">
      {mockVideos.map((v, i) => (
        <motion.div
          key={v.key}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
          className="rounded-xl overflow-hidden border border-border/20 cursor-pointer group"
        >
          <div className={`bg-gradient-to-b ${v.gradient} aspect-[9/16] flex flex-col items-center justify-center relative`}>
            <span className="text-3xl sm:text-4xl">{v.emoji}</span>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3">
              <p className="text-white text-[10px] sm:text-xs line-clamp-2 leading-tight">{t(`tiktok_videos.${v.key}.title`)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/60 text-[10px]">♥ {v.likes}</span>
                <span className="text-white/60 text-[10px]">▶ {v.views}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
