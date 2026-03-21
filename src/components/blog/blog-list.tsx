'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { CategoryFilter } from './category-filter';
import { BlogCard } from './blog-card';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogPost, BlogCategory } from '@/lib/blog-types';

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  const t = useTranslations('blog');
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = (() => {
    let result = posts;
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const title = (p.title as Record<string, string>)?.zh || '';
        const excerpt = p.excerpt || '';
        return title.toLowerCase().includes(q) || excerpt.toLowerCase().includes(q);
      });
    }
    return result;
  })();

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

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文章..."
            className={cn(
              'w-full rounded-full border border-border/60 bg-card/60 pl-11 pr-10 py-2.5',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-brand-mint/40 focus:border-brand-mint/60',
              'backdrop-blur-sm transition-all'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/60 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {searchQuery && (
          <p className="text-xs text-muted-foreground mb-4">
            {filteredPosts.length === 0 ? '未找到相关文章' : `找到 ${filteredPosts.length} 篇相关文章`}
          </p>
        )}

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
