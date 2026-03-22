'use client';

import { Marked } from 'marked';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// Use synchronous marked instance
const markedInstance = new Marked({
  gfm: true,
  breaks: true,
  async: false,
});

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => {
    if (!content) return '';
    // parse() with async:false returns string synchronously
    return markedInstance.parse(content) as string;
  }, [content]);

  return (
    <div
      className={cn(
        'prose prose-neutral dark:prose-invert max-w-none',
        // h1: 大字号，品牌色渐变
        'prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-10 prose-h1:mb-6',
        'prose-h1:bg-gradient-to-r prose-h1:from-brand-cyan prose-h1:to-brand-mint prose-h1:bg-clip-text prose-h1:text-transparent',
        // h2: 中字号，左侧竖线
        'prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-5',
        'prose-h2:border-l-2 prose-h2:border-brand-cyan prose-h2:pl-4',
        // h3: brand-mint 颜色
        'prose-h3:text-lg prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-brand-mint',
        // 段落: 舒适行间距
        'prose-p:text-base prose-p:leading-relaxed prose-p:mb-4 prose-p:text-muted-foreground',
        // 链接
        'prose-a:text-brand-cyan prose-a:no-underline hover:prose-a:underline',
        // 行内代码
        'prose-code:bg-brand-cyan/10 prose-code:text-brand-cyan prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none',
        // 代码块: GitHub暗色背景
        'prose-pre:bg-[#0d1117] prose-pre:rounded-xl prose-pre:p-5 prose-pre:my-6',
        // 引用块: 渐变竖线 + 轻微背景
        'prose-blockquote:border-l-0 prose-blockquote:pl-0 prose-blockquote:my-6',
        'prose-blockquote:bg-brand-cyan/5 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg',
        'prose-blockquote:relative prose-blockquote:before:content-[""] prose-blockquote:before:absolute prose-blockquote:before:left-0 prose-blockquote:before:top-0 prose-blockquote:before:bottom-0 prose-blockquote:before:w-1 prose-blockquote:before:bg-gradient-to-b prose-blockquote:before:from-brand-cyan prose-blockquote:before:to-brand-mint prose-blockquote:before:rounded-full',
        'prose-blockquote:text-muted-foreground prose-blockquote:italic',
        // 列表
        'prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-ul:my-4 prose-ol:my-4',
        'prose-li:text-muted-foreground prose-li:leading-relaxed prose-li:mb-1',
        '[&_ul>li::marker]:text-brand-cyan [&_ol>li::marker]:text-brand-cyan',
        // 强调
        'prose-strong:text-foreground prose-strong:font-semibold',
        // 分割线: 渐变线
        'prose-hr:border-0 prose-hr:h-px prose-hr:bg-gradient-to-r prose-hr:from-transparent prose-hr:via-brand-cyan/30 prose-hr:to-transparent prose-hr:my-10',
        // 表格
        'prose-table:border-collapse prose-th:border prose-th:border-border prose-th:p-2 prose-td:border prose-td:border-border prose-td:p-2',
        // 图片
        '[&_img]:rounded-xl [&_img]:shadow-md',
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
