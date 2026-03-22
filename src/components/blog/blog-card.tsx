'use client';

import { useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogPost, BlogCategory } from '@/lib/blog-types';
import { CATEGORY_KEYS } from '@/lib/blog-types';
import { Link } from '@/i18n/navigation';
import { SpotlightCard, BorderBeam } from '@/components/ui/aceternity';

const CATEGORY_TAG_COLORS: Record<BlogCategory, string> = {
  ai: 'bg-brand-cyan/15 text-brand-cyan shadow-[0_0_8px_rgba(56,189,248,0.15)]',
  tech: 'bg-brand-mint/15 text-brand-mint shadow-[0_0_8px_rgba(94,234,212,0.15)]',
  life: 'bg-brand-coral/15 text-brand-coral shadow-[0_0_8px_rgba(251,191,36,0.15)]',
  cats: 'bg-brand-mango/15 text-brand-mango shadow-[0_0_8px_rgba(252,211,77,0.15)]',
  business: 'bg-brand-taro/15 text-brand-taro shadow-[0_0_8px_rgba(192,132,252,0.15)]',
};

const COVER_GRADIENTS: Record<BlogCategory, string> = {
  ai: 'from-brand-cyan/20 to-brand-cyan/5',
  tech: 'from-brand-mint/20 to-brand-mint/5',
  life: 'from-brand-coral/20 to-brand-coral/5',
  cats: 'from-brand-mango/20 to-brand-mango/5',
  business: 'from-brand-taro/20 to-brand-taro/5',
};

const COVER_ICONS: Record<BlogCategory, string> = {
  ai: '🤖',
  tech: '⚙️',
  life: '🌸',
  cats: '🐱',
  business: '💼',
};

const BORDER_BEAM_COLORS: Record<BlogCategory, { from: string; to: string }> = {
  ai: { from: '#38bdf8', to: '#818cf8' },
  tech: { from: '#5eead4', to: '#34d399' },
  life: { from: '#fbbf24', to: '#f87171' },
  cats: { from: '#fcd34d', to: '#fbbf24' },
  business: { from: '#c084fc', to: '#a855f7' },
};

interface BlogCardProps {
  post: BlogPost;
  isLatest?: boolean;
}

// 单个卡片的入场动画变体
const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export function BlogCard({ post, isLatest = false }: BlogCardProps) {
  const locale = useLocale();
  const t = useTranslations('blog');
  const [isHovered, setIsHovered] = useState(false);
  const title = post.title[locale] || post.title.zh || post.title.en || '';
  const excerpt = post.excerpt[locale] || post.excerpt.zh || post.excerpt.en || '';
  
  const beamColors = BORDER_BEAM_COLORS[post.category];

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/blog/${post.slug}`}>
        <SpotlightCard className="p-0 glass-card border-white/[0.06] bg-card/80 dark:bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5">
          <article className="group relative flex flex-col overflow-hidden">
            {/* BorderBeam for latest post - 始终显示 */}
            {isLatest && (
              <BorderBeam
                colorFrom="#5eead4"
                colorTo="#38bdf8"
                size={180}
                duration={10}
              />
            )}
            
            {/* BorderBeam on hover - 普通卡片悬停时显示 */}
            {!isLatest && isHovered && (
              <BorderBeam
                colorFrom={beamColors.from}
                colorTo={beamColors.to}
                size={160}
                duration={8}
              />
            )}

            {/* Cover Image Placeholder with hover scale animation */}
            <div
              className={cn(
                'relative flex h-40 items-center justify-center bg-gradient-to-br overflow-hidden',
                COVER_GRADIENTS[post.category]
              )}
            >
              <motion.span 
                className="text-5xl opacity-60"
                animate={{ 
                  scale: isHovered ? 1.15 : 1,
                  rotate: isHovered ? 5 : 0,
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: 'easeOut',
                }}
              >
                {COVER_ICONS[post.category]}
              </motion.span>
              
              {/* 悬停时的微光效果 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ 
                  x: isHovered ? '100%' : '-100%',
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 p-4">
              {/* Category + Reading Time */}
              <div className="flex items-center gap-2">
                <motion.span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                    CATEGORY_TAG_COLORS[post.category]
                  )}
                  animate={{
                    scale: isHovered ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {t(CATEGORY_KEYS[post.category])}
                </motion.span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {post.readingTime} {t('min_read')}
                </span>
              </div>

              {/* Title with hover animation */}
              <motion.h2 
                className="text-lg font-semibold leading-snug line-clamp-2 transition-colors group-hover:text-brand-cyan"
                animate={{
                  y: isHovered ? -2 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                {title}
              </motion.h2>

              {/* Excerpt */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {excerpt}
              </p>

              {/* Date */}
              <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span className="ml-auto text-muted-foreground/60">by {post.author}</span>
              </div>
            </div>
          </article>
        </SpotlightCard>
      </Link>
    </motion.div>
  );
}
