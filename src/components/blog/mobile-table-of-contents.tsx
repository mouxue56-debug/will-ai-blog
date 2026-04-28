'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { List, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface MobileTableOfContentsProps {
  headings: TocHeading[];
}

export function MobileTableOfContents({ headings }: MobileTableOfContentsProps) {
  const t = useTranslations('blog');
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

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
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile TOC Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="xl:hidden fixed bottom-20 right-4 z-30 flex items-center gap-2 rounded-full bg-brand-mint/90 text-white px-4 py-2.5 shadow-lg shadow-brand-mint/20 backdrop-blur-sm"
      >
        <List className="h-4 w-4" />
        <span className="text-sm font-medium">{t('table_of_contents')}</span>
      </button>

      {/* Mobile TOC Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="xl:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="xl:hidden fixed right-0 top-0 bottom-0 z-50 w-72 bg-background border-l border-border p-5 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <List className="h-4 w-4" />
                  {t('table_of_contents')}
                </h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                  aria-label="Close table of contents"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-1 border-l border-border/70">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <button
                      onClick={() => handleClick(heading.id)}
                      className={cn(
                        'w-full text-left block border-l-2 py-1.5 pr-2 text-sm transition-colors',
                        heading.level === 2 ? 'pl-4' : 'pl-7 text-[13px]',
                        activeId === heading.id
                          ? 'border-brand-cyan text-brand-cyan font-medium'
                          : 'border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                      )}
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
