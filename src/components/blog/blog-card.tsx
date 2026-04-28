'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
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
  learning: 'bg-brand-cyan/15 text-brand-cyan shadow-[0_0_8px_rgba(0,212,255,0.15)]',
};

const COVER_GRADIENTS: Record<BlogCategory, string> = {
  ai: 'from-brand-cyan/20 to-brand-cyan/5',
  tech: 'from-brand-mint/20 to-brand-mint/5',
  life: 'from-brand-coral/20 to-brand-coral/5',
  cats: 'from-brand-mango/20 to-brand-mango/5',
  business: 'from-brand-taro/20 to-brand-taro/5',
  learning: 'from-brand-cyan/20 to-brand-cyan/5',
};

const COVER_ICONS: Record<BlogCategory, string> = {
  ai: '🤖',
  tech: '⚙️',
  life: '🌸',
  cats: '🐱',
  business: '💼',
  learning: '📚',
};

const BORDER_BEAM_COLORS: Record<BlogCategory, { from: string; to: string }> = {
  ai: { from: '#38bdf8', to: '#818cf8' },
  tech: { from: '#5eead4', to: '#34d399' },
  life: { from: '#fbbf24', to: '#f87171' },
  cats: { from: '#fcd34d', to: '#fbbf24' },
  business: { from: '#c084fc', to: '#a855f7' },
  learning: { from: '#00d4ff', to: '#5ef0c8' },
};

interface BlogCardProps {
  post: BlogPost;
  isLatest?: boolean;
  index?: number;
}

export function BlogCard({ post, isLatest = false, index = 0 }: BlogCardProps) {
  const locale = useLocale();
  const t = useTranslations('blog');
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const title = post.title[locale] || post.title.zh || post.title.en || '';
  const excerpt = post.excerpt[locale] || post.excerpt.zh || post.excerpt.en || '';

  // Reset image error state when coverImage changes
  useEffect(() => {
    setImageError(false);
  }, [post.coverImage]);
  
  const beamColors = BORDER_BEAM_COLORS[post.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/blog/${post.slug}`}>
        <SpotlightCard className="p-0 glass-card border-white/[0.06] bg-card/80 dark:bg-white/[0.03] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,212,255,0.07)]">
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
            
            {/* BorderBeam on hover - 普通卡片悬停时平滑淡入 */}
            {!isLatest && (
              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
                style={{ opacity: isHovered ? 1 : 0 }}
              >
                <BorderBeam
                  colorFrom={beamColors.from}
                  colorTo={beamColors.to}
                  size={160}
                  duration={8}
                />
              </div>
            )}

            {/* Cover Image - 如果有封面图且未出错则显示封面图，否则显示占位图 */}
            {(post.coverImage && !imageError) ? (
              <motion.div
                className="relative w-full aspect-video overflow-hidden"
                animate={{ scale: isHovered ? 1.04 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={post.coverImage}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  unoptimized={!post.coverImage.startsWith('/')}
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
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
              </motion.div>
            ) : (
              <motion.div
                className={cn(
                  'relative flex h-40 items-center justify-center bg-gradient-to-br overflow-hidden',
                  COVER_GRADIENTS[post.category]
                )}
                animate={{ scale: isHovered ? 1.04 : 1 }}
                transition={{ duration: 0.3 }}
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
              </motion.div>
            )}

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
              <p className="text-sm text-muted-foreground line-clamp-2 transition-colors duration-300 group-hover:text-foreground/70">
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
                {/* 历史归档标签：使用 contentSource 判断，与 blog-detail 保持一致 */}
                {post.contentSource === 'ai-organized' && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                    AI整理
                  </span>
                )}
              </div>
            </div>
          </article>
        </SpotlightCard>
      </Link>
    </motion.div>
  );
}
