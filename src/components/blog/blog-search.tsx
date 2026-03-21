'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/lib/blog-types';
import { Link } from '@/i18n/navigation';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  date?: string;
}

export function BlogSearch({ posts }: { posts: BlogPost[] }) {
  const locale = useLocale() as 'zh' | 'ja' | 'en';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BlogPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const lower = q.toLowerCase();
    const filtered = posts.filter((post) => {
      const title = post.title?.[locale] || post.title?.zh || '';
      const excerpt = post.excerpt || '';
      return (
        title.toLowerCase().includes(lower) ||
        excerpt.toLowerCase().includes(lower) ||
        (post.tags || []).some((t: string) => t.toLowerCase().includes(lower))
      );
    });
    setResults(filtered);
  }, [posts, locale]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章..."
          className={cn(
            'w-full rounded-full border border-border/60 bg-card/60 pl-11 pr-10 py-2.5',
            'text-sm placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-brand-mint/40 focus:border-brand-mint/60',
            'backdrop-blur-sm transition-all'
          )}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/60 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {query && (
        <div className="mt-3 space-y-2">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              未找到相关文章
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground px-2">
                找到 {results.length} 篇相关文章
              </p>
              {results.slice(0, 5).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  onClick={() => setQuery('')}
                  className={cn(
                    'block rounded-xl border border-border/40 bg-card/60 p-4',
                    'hover:border-brand-mint/40 hover:bg-card/80',
                    'backdrop-blur-sm transition-all group'
                  )}
                >
                  <h4 className="text-sm font-semibold group-hover:text-brand-mint transition-colors">
                    {post.title?.[locale] || post.title?.zh}
                  </h4>
                  {post.excerpt && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
