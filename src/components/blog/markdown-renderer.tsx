'use client';

import { marked } from 'marked';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => {
    if (!content) return '';
    return marked.parse(content) as string;
  }, [content]);

  return (
    <div
      className={cn(
        'prose prose-neutral dark:prose-invert max-w-none',
        'prose-h1:text-2xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-4',
        'prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2',
        'prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3',
        'prose-p:text-base prose-p:leading-relaxed prose-p:text-muted-foreground',
        'prose-a:text-brand-cyan prose-a:no-underline hover:prose-a:underline',
        'prose-code:text-brand-mint prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono',
        'prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:p-4',
        'prose-blockquote:border-l-brand-cyan prose-blockquote:text-muted-foreground prose-blockquote:italic',
        'prose-ul:text-muted-foreground prose-ol:text-muted-foreground',
        'prose-li:text-muted-foreground prose-li:leading-relaxed',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-hr:border-border prose-hr:my-8',
        'prose-table:border-collapse prose-th:border prose-th:border-border prose-th:p-2 prose-td:border prose-td:border-border prose-td:p-2',
        '[&_img]:rounded-xl [&_img]:shadow-md',
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
