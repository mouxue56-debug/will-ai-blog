'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
        <ScrollReveal direction="fadeIn">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground/85 sm:text-base">
              {t('page_intro')}
            </p>
          </div>
        </ScrollReveal>

        <div className="mb-8">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {filteredPosts.length > 0 ? (
          <ScrollReveal
            direction="fadeIn"
            stagger={0.06}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {filteredPosts.map((post, index) => (
              <BlogCard key={post.slug} post={post} isLatest={index === 0} />
            ))}
          </ScrollReveal>
        ) : (
          <div className="py-20 text-center text-muted-foreground">{t('no_posts')}</div>
        )}
      </div>
    </PageTransition>
  );
}
