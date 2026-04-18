'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { CategoryFilter } from './category-filter';
import { BlogCard } from './blog-card';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
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
        const title = typeof p.title === 'object' ? (p.title as Record<string, string>)?.zh || '' : String(p.title || '');
        const excerpt = typeof p.excerpt === 'object'
          ? (p.excerpt as Record<string, string>)?.zh || (p.excerpt as Record<string, string>)?.en || ''
          : String(p.excerpt || '');
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
          <div className="mb-8 overflow-hidden rounded-3xl border border-brand-coral/15 dark:border-white/8 bg-gradient-to-br from-brand-coral/8 via-brand-mango/5 to-brand-mint/8 dark:from-brand-coral/10 dark:via-transparent dark:to-brand-mint/8">
            <div className="relative flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12">
              {/* Decorative ice cream dot pattern */}
              <div className="pointer-events-none absolute right-6 top-4 flex gap-2 opacity-30 sm:right-10 sm:top-6">
                <span className="h-3 w-3 rounded-full bg-brand-strawberry" />
                <span className="h-2.5 w-2.5 rounded-full bg-brand-mango mt-0.5" />
                <span className="h-3.5 w-3.5 rounded-full bg-brand-mint" />
                <span className="h-2 w-2 rounded-full bg-brand-taro mt-1" />
                <span className="h-3 w-3 rounded-full bg-brand-cyan" />
              </div>
              <div className="pointer-events-none absolute bottom-4 right-14 flex gap-1.5 opacity-20">
                <span className="h-2 w-2 rounded-full bg-brand-coral" />
                <span className="h-2.5 w-2.5 rounded-full bg-brand-mint mt-0.5" />
                <span className="h-2 w-2 rounded-full bg-brand-taro" />
              </div>
              <h1 className="text-3xl font-bold sm:text-4xl">{t('title')}</h1>
              <p className="mt-2 text-muted-foreground font-medium">{t('subtitle')}</p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground/80">
                {t('page_intro')}
              </p>
              <div className="mt-4 flex gap-2 flex-wrap">
                {(['🍦', '🤖', '🐱', '🌸', '📝'].map((icon, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur-sm">
                    {icon}
                  </span>
                )))}
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
              'w-full rounded-full border border-border/60 bg-card/60 py-2.5 pl-11 pr-10',
              'text-sm placeholder:text-muted-foreground',
              'focus:border-brand-mint/60 focus:outline-none focus:ring-2 focus:ring-brand-mint/40',
              'backdrop-blur-sm transition-all'
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 rounded-full p-1 transition-colors hover:bg-muted/60"
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

            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-brand-coral/12 dark:border-white/8 bg-card/50 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">{currentCopy.page(safeCurrentPage, totalPages)}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-coral/20 dark:border-white/10 px-4 py-2 text-sm text-foreground transition-colors hover:bg-brand-coral/8 dark:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {currentCopy.prev}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-coral/20 dark:border-white/10 px-4 py-2 text-sm text-foreground transition-colors hover:bg-brand-coral/8 dark:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
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
