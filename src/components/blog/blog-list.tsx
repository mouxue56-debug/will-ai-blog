'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { CategoryFilter } from './category-filter';
import { BlogCard } from './blog-card';
import type { BlogPost, BlogCategory } from '@/lib/blog-types';

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  const t = useTranslations('blog');
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.category === selectedCategory)
    : posts;

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        {/* Header */}
        <ScrollReveal direction="fadeUp">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
          </div>
        </ScrollReveal>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Post Grid with layout animation */}
        <AnimatePresence mode="popLayout">
          {filteredPosts.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
                  >
                    <BlogCard post={post} isLatest={index === 0} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center text-muted-foreground"
            >
              {t('no_posts')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
