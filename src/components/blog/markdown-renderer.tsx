'use client';

import { Marked, Renderer } from 'marked';
import { useMemo } from 'react';

// ─── Theme-aware prose CSS (scoped to .k2w-prose) ────────────────────────────
// Uses CSS variables so it respects both dark and light themes.
// Accent = brand-mint (#7DD3C0 dark / brand-mint-dark for headings).
const DEEP_OCEAN_CSS = `
.k2w-prose {
  color: hsl(var(--foreground));
  line-height: 1.8;
  font-size: 1rem;
}

/* Headings */
.k2w-prose h1,
.k2w-prose h2,
.k2w-prose h3,
.k2w-prose h4,
.k2w-prose h5,
.k2w-prose h6 {
  scroll-margin-top: 6rem;
}
.k2w-prose h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 2.5rem 0 1.5rem;
  color: hsl(var(--foreground));
  line-height: 1.3;
}
.k2w-prose h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-brand-mint-dark, #5BC4A8);
  border-left: 3px solid var(--color-brand-mint, #7DD3C0);
  padding-left: 15px;
  margin: 2rem 0 1rem;
  line-height: 1.4;
}
.k2w-prose h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 1.8rem 0 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid color-mix(in srgb, var(--color-brand-mint) 30%, transparent);
  line-height: 1.4;
}
.k2w-prose h4, .k2w-prose h5, .k2w-prose h6 {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 1.5rem 0 0.6rem;
}

/* Paragraph */
.k2w-prose p {
  margin: 0 0 1.2rem;
  color: hsl(var(--foreground));
}

/* Bold */
.k2w-prose strong {
  color: hsl(var(--foreground));
  font-weight: 700;
}

/* Italic */
.k2w-prose em {
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

/* Inline code */
.k2w-prose code {
  background: color-mix(in srgb, var(--color-brand-mint) 12%, transparent);
  color: var(--color-brand-mint-dark, #5BC4A8);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.88em;
}

/* Code block wrapper */
.k2w-pre-wrapper {
  position: relative;
  margin: 1.5rem 0;
}
.k2w-lang-tag {
  display: inline-block;
  background: color-mix(in srgb, var(--color-brand-mint) 12%, transparent);
  color: var(--color-brand-mint-dark, #5BC4A8);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  margin-bottom: 6px;
  letter-spacing: 0.05em;
}
.k2w-prose pre {
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
  margin: 0;
}
.k2w-prose pre code {
  background: none;
  color: hsl(var(--foreground));
  padding: 0;
  border-radius: 0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
}

/* Blockquote */
.k2w-prose blockquote {
  background: color-mix(in srgb, var(--color-brand-mint) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-brand-mint) 20%, transparent);
  border-left: 4px solid var(--color-brand-mint, #7DD3C0);
  border-radius: 0 12px 12px 0;
  padding: 16px 20px;
  margin: 1.5rem 0;
  font-style: normal;
}
.k2w-prose blockquote p {
  margin: 0;
  color: hsl(var(--muted-foreground));
}

/* HR */
.k2w-prose hr {
  background: linear-gradient(90deg, transparent, var(--color-brand-mint, #7DD3C0), transparent);
  height: 1px;
  border: none;
  margin: 2.5rem 0;
}

/* Lists */
.k2w-prose ul {
  margin: 1rem 0 1.2rem;
  padding-left: 1.5rem;
  list-style: none;
}
.k2w-prose ul li {
  position: relative;
  padding-left: 1.2rem;
  margin-bottom: 0.5rem;
  color: hsl(var(--foreground));
  line-height: 1.7;
}
.k2w-prose ul li::before {
  content: "▸";
  position: absolute;
  left: 0;
  color: var(--color-brand-mint, #7DD3C0);
  font-size: 0.8em;
  top: 0.15em;
}
.k2w-prose ol {
  margin: 1rem 0 1.2rem;
  padding-left: 0;
  list-style: none;
  counter-reset: k2w-counter;
}
.k2w-prose ol li {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 0.5rem;
  color: hsl(var(--foreground));
  line-height: 1.7;
  counter-increment: k2w-counter;
}
.k2w-prose ol li::before {
  content: counter(k2w-counter) ".";
  position: absolute;
  left: 0;
  color: var(--color-brand-mint, #7DD3C0);
  font-weight: 600;
  font-size: 0.9em;
}

/* Tables */
.k2w-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 1.5rem 0;
  border-radius: 12px;
}
.k2w-prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  font-size: 0.95rem;
}
.k2w-prose thead {
  background: color-mix(in srgb, var(--color-brand-mint) 8%, transparent);
}
.k2w-prose th {
  background: color-mix(in srgb, var(--color-brand-mint) 12%, transparent);
  color: var(--color-brand-mint-dark, #5BC4A8);
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid color-mix(in srgb, var(--color-brand-mint) 30%, transparent);
}
.k2w-prose td {
  padding: 10px 16px;
  border-bottom: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
}
.k2w-prose tr:hover td {
  background: color-mix(in srgb, var(--color-brand-mint) 4%, transparent);
}

/* Links */
.k2w-prose a {
  color: var(--color-brand-mint-dark, #5BC4A8);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--color-brand-mint) 40%, transparent);
  transition: border-color 0.2s;
}
.k2w-prose a:hover {
  border-bottom-color: var(--color-brand-mint, #7DD3C0);
}

/* Images */
.k2w-prose img {
  max-width: 100%;
  border-radius: 12px;
  margin: 1.5rem 0;
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
}
`;

// ─── Custom Renderer ──────────────────────────────────────────────────────────
function createDeepOceanRenderer(): Renderer {
  const renderer = new Renderer();

  // h1-h6 with auto-generated id for StickyNav anchor links
  renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
    // Strip HTML tags to get plain text for the id
    const plain = text.replace(/<[^>]+>/g, '').trim();
    const id = plain
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\u3040-\u30ff]+/g, '-')
      .replace(/^-|-$/g, '');
    // Skip id attribute when empty (e.g. emoji-only headings) to avoid id=""
    const idAttr = id ? ` id="${id}"` : '';
    return `<h${depth}${idAttr}>${text}</h${depth}>\n`;
  };

  // Code block with optional language tag
  renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
    const escapedCode = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const escapedLang = lang
      ? lang.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      : '';
    const langTag = escapedLang
      ? `<span class="k2w-lang-tag">${escapedLang}</span>\n`
      : '';
    return (
      `<div class="k2w-pre-wrapper">${langTag}<pre><code>${escapedCode}</code></pre></div>\n`
    );
  };

  // Inline code — handled by CSS, no custom renderer needed
  // (default renderer wraps in <code> which CSS already styles)

  // Blockquote
  renderer.blockquote = ({ text }: { text: string }) => {
    return `<blockquote>${text}</blockquote>\n`;
  };

  // HR
  renderer.hr = () => {
    return `<hr />\n`;
  };

  // Strong (bold)
  renderer.strong = ({ text }: { text: string }) => {
    return `<strong>${text}</strong>`;
  };

  return renderer;
}

// ─── Marked instance ─────────────────────────────────────────────────────────
const deepOceanMarked = new Marked({
  gfm: true,
  breaks: true,
  async: false,
  renderer: createDeepOceanRenderer(),
});

// ─── Component ────────────────────────────────────────────────────────────────
interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => {
    if (!content) return '';
    const parsed = (deepOceanMarked.parse(content) as string)
      .replace(/<table>/g, '<div class="k2w-table-wrapper"><table>')
      .replace(/<\/table>/g, '</table></div>');
    return `<style>${DEEP_OCEAN_CSS}</style>${parsed}`;
  }, [content]);

  return (
    <div
      className="k2w-prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
