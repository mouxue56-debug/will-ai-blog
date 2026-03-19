'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\u3040-\u30ff]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = markdownToHtml(content);

  return (
    <div
      className={cn(
        'prose prose-neutral dark:prose-invert max-w-none',
        // Headings
        'prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2',
        'prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3',
        // Paragraphs
        'prose-p:text-base prose-p:leading-relaxed prose-p:text-muted-foreground',
        // Links
        'prose-a:text-brand-cyan prose-a:no-underline hover:prose-a:underline',
        // Lists
        'prose-li:text-muted-foreground prose-li:leading-relaxed',
        // Code blocks
        'prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg',
        'prose-code:text-brand-cyan prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none',
        // Strong
        'prose-strong:text-foreground',
        // Table
        'prose-table:text-sm',
        'prose-th:bg-muted prose-th:px-3 prose-th:py-2',
        'prose-td:px-3 prose-td:py-2 prose-td:border-border',
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = escapeHtml(code.trim());
    return `<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Tables
  html = html.replace(
    /(?:^|\n)(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/g,
    (_match, headerRow: string, _sep: string, bodyRows: string) => {
      const headers = headerRow.split('|').filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join('');
      const rows = bodyRows.trim().split('\n').map((row: string) => {
        const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    }
  );

  // Headings (h2, h3)
  html = html.replace(/^### (.+)$/gm, (_match, text) => {
    const id = generateId(text);
    return `<h3 id="${id}">${text}</h3>`;
  });
  html = html.replace(/^## (.+)$/gm, (_match, text) => {
    const id = generateId(text);
    return `<h2 id="${id}">${text}</h2>`;
  });

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Unordered lists
  html = html.replace(/(?:^|\n)((?:- .+\n?)+)/g, (_match, listBlock: string) => {
    const items = listBlock.trim().split('\n').map((item: string) => {
      const text = item.replace(/^- /, '');
      return `<li>${text}</li>`;
    }).join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/(?:^|\n)((?:\d+\. .+\n?)+)/g, (_match, listBlock: string) => {
    const items = listBlock.trim().split('\n').map((item: string) => {
      const text = item.replace(/^\d+\. /, '');
      return `<li>${text}</li>`;
    }).join('');
    return `<ol>${items}</ol>`;
  });

  // Paragraphs - wrap remaining text in <p> tags
  html = html.replace(/(?:^|\n\n)([^<\n][^\n]*(?:\n(?![<#\-\d|])[^\n]+)*)(?:\n\n|$)/g, '<p>$1</p>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr />');

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
