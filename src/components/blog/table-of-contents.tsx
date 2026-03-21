'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const t = useTranslations('blog');
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeading = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visibleHeading) {
          setActiveId(visibleHeading.target.id);
        }
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: [0, 1] }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-border/60 bg-background/80 p-5 backdrop-blur">
      <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <List className="h-4 w-4" />
        {t('table_of_contents')}
      </h4>
      <ul className="space-y-1 border-l border-border/70">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                'block border-l-2 py-1.5 pr-2 text-sm transition-colors',
                heading.level === 2 ? 'pl-4' : 'pl-7 text-[13px]',
                activeId === heading.id
                  ? 'border-brand-cyan text-brand-cyan font-medium'
                  : 'border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
