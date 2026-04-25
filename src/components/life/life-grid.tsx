'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { lifePosts, type LifePost } from '@/data/life';
import type { Locale } from '@/lib/locale';

type Category = 'all' | LifePost['category'];

const categoryConfig: { key: Category; emoji: string }[] = [
  { key: 'all', emoji: '' },
  { key: 'cats', emoji: '🐱' },
  { key: 'osaka', emoji: '🏙️' },
  { key: 'food', emoji: '🍜' },
  { key: 'travel', emoji: '✈️' },
];

function LifeCard({ post, index, locale }: { post: LifePost; index: number; locale: Locale }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      className="group break-inside-avoid mb-4"
    >
      <div className="glass-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
        {/* Gradient image placeholder */}
        <div
          className={`relative bg-gradient-to-br ${post.imageGradient} flex items-center justify-center`}
          style={{ height: `${140 + (index % 3) * 40}px` }}
        >
          <span className="text-4xl sm:text-5xl drop-shadow-md">{post.emoji}</span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-sm sm:text-base leading-snug mb-1.5 line-clamp-2">
            {post.title[locale]}
          </h3>
          <time className="text-xs text-muted-foreground">{post.date}</time>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {post.description[locale]}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function LifeGrid() {
  const t = useTranslations('life');
  const locale = useLocale() as Locale;
  const [active, setActive] = useState<Category>('all');

  const filtered = active === 'all'
    ? lifePosts
    : lifePosts.filter((p) => p.category === active);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categoryConfig.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActive(cat.key)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${active === cat.key
                ? 'bg-foreground text-background shadow-md'
                : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }
            `}
          >
            {cat.emoji ? `${cat.emoji} ` : ''}{t(`filter_${cat.key}`)}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="columns-2 lg:columns-3 gap-4">
        {filtered.map((post, i) => (
          <LifeCard key={post.id} post={post} index={i} locale={locale} />
        ))}
      </div>
    </div>
  );
}
