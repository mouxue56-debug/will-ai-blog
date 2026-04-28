'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { CategoryFilter } from './category-filter';
import { BlogCard } from './blog-card';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import Image from 'next/image';
import { getIllustrationUrl } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { BlogPost, BlogCategory } from '@/lib/blog-types';

interface BlogListProps {
  posts: BlogPost[];
}

const paginationCopy = {
  zh: {
    search: '搜索文章...',
    noResults: '未找到相关文章',
    found: (count: number) => `找到 ${count} 篇相关文章`,
    page: (current: number, total: number) => `第 ${current} 页 / 共 ${total} 页`,
    prev: '上一页',
    next: '下一页',
  },
  ja: {
    search: '記事を検索...',
    noResults: '該当する記事が見つかりません',
    found: (count: number) => `${count} 件の記事`,
    page: (current: number, total: number) => `${current} / ${total} ページ`,
    prev: '前へ',
    next: '次へ',
  },
  en: {
    search: 'Search posts...',
    noResults: 'No matching posts found',
    found: (count: number) => `${count} matching posts`,
    page: (current: number, total: number) => `Page ${current} of ${total}`,
    prev: 'Previous',
    next: 'Next',
  },
} as const;

// Stagger container variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 0.1s delay between each card
      delayChildren: 0.1,
    },
  },
};

export function BlogList({ posts }: BlogListProps) {
  const locale = useLocale() as keyof typeof paginationCopy;
  const t = useTranslations('blog');
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const syncItemsPerPage = () => setItemsPerPage(mediaQuery.matches ? 12 : 6);

    syncItemsPerPage();
    mediaQuery.addEventListener('change', syncItemsPerPage);
    return () => mediaQuery.removeEventListener('change', syncItemsPerPage);
  }, []);

  const filteredPosts = (() => {
    let result = posts;
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const title = p.title[locale] || p.title.zh || '';
        const excerpt = p.excerpt[locale] || p.excerpt.en || '';
        return title.toLowerCase().includes(q) || excerpt.toLowerCase().includes(q);
      });
    }
    return result;
  })();

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentCopy = paginationCopy[locale] ?? paginationCopy.zh;
  const paginatedPosts = filteredPosts.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <ScrollReveal direction="fadeIn">
          <div className="glass-card mb-8 overflow-hidden rounded-3xl">
            <div className="relative h-48 w-full sm:h-56">
              <Image
                src={getIllustrationUrl('blog-banner')}
                alt={t('title')}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover object-center opacity-60 dark:opacity-80"
              />
              {/* Dior candy wash (light) — hidden in dark */}
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,209,220,0.55)] via-[rgba(232,213,245,0.40)] to-[rgba(200,245,228,0.35)] dark:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/55 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8">
                <h1 className="text-3xl font-bold sm:text-4xl text-dior-gradient text-dior-gradient-breathing">{t('title')}</h1>
                <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
                <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground/80">
                  {t('page_intro')}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="mb-8">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={currentCopy.search}
            className={cn(
              'glass-pill w-full py-2.5 pl-11 pr-10',
              'text-sm placeholder:text-muted-foreground',
              'focus:border-brand-mint/60 focus:outline-none focus:ring-2 focus:ring-brand-mint/40',
              'transition-all'
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 rounded-full p-1 transition-colors hover:bg-muted/60"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {searchQuery && (
          <p className="mb-4 text-xs text-muted-foreground">
            {filteredPosts.length === 0 ? currentCopy.noResults : currentCopy.found(filteredPosts.length)}
          </p>
        )}

        {filteredPosts.length > 0 ? (
          <>
            {/* Blog cards grid with stagger animation */}
            <motion.div
              key={safeCurrentPage}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {paginatedPosts.map((post, index) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  isLatest={safeCurrentPage === 1 && index === 0}
                  index={index}
                />
              ))}
            </motion.div>

            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/8 bg-card/50 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">{currentCopy.page(safeCurrentPage, totalPages)}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-foreground transition-all duration-300 hover:border-brand-cyan/30 hover:bg-white/[0.06] hover:shadow-[0_0_18px_-6px_rgba(0,212,255,0.35)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:shadow-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {currentCopy.prev}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-foreground transition-all duration-300 hover:border-brand-cyan/30 hover:bg-white/[0.06] hover:shadow-[0_0_18px_-6px_rgba(0,212,255,0.35)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:shadow-none"
                >
                  {currentCopy.next}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-muted-foreground">{t('no_posts')}</div>
        )}
      </div>
    </PageTransition>
  );
}
