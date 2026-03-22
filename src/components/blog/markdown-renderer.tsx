'use client';

import { Marked, Renderer } from 'marked';
import { useMemo } from 'react';

// ─── Deep Ocean CSS (scoped to .k2w-prose) ───────────────────────────────────
const DEEP_OCEAN_CSS = `
.k2w-prose {
  color: #E8F4F8;
  background: #0D1825;
  line-height: 1.8;
  font-size: 1rem;
}

/* Headings */
.k2w-prose h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 2.5rem 0 1.5rem;
  background: linear-gradient(135deg, #00D4FF 0%, #FF8C42 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
}
.k2w-prose h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #00D4FF;
  border-left: 3px solid #FF8C42;
  padding-left: 15px;
  margin: 2rem 0 1rem;
  line-height: 1.4;
}
.k2w-prose h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #E8F4F8;
  margin: 1.8rem 0 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid #00D4FF;
  line-height: 1.4;
}
.k2w-prose h4, .k2w-prose h5, .k2w-prose h6 {
  font-size: 1rem;
  font-weight: 600;
  color: #E8F4F8;
  margin: 1.5rem 0 0.6rem;
}

/* Paragraph */
.k2w-prose p {
  margin: 0 0 1.2rem;
  color: #E8F4F8;
}

/* Bold */
.k2w-prose strong {
  color: #FF8C42;
  font-weight: 600;
}

/* Italic */
.k2w-prose em {
  color: rgba(232,244,248,0.85);
  font-style: italic;
}

/* Inline code */
.k2w-prose code {
  background: rgba(0,212,255,0.1);
  color: #00D4FF;
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
  background: rgba(0,212,255,0.1);
  color: #00D4FF;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  margin-bottom: 6px;
  letter-spacing: 0.05em;
}
.k2w-prose pre {
  background: #0A1420;
  border: 1px solid rgba(0,212,255,0.2);
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
  margin: 0;
}
.k2w-prose pre code {
  background: none;
  color: #E8F4F8;
  padding: 0;
  border-radius: 0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
}

/* Blockquote */
.k2w-prose blockquote {
  background: rgba(0,212,255,0.05);
  border: 1px solid rgba(0,212,255,0.2);
  border-left: 4px solid #00D4FF;
  border-radius: 0 12px 12px 0;
  padding: 16px 20px;
  margin: 1.5rem 0;
  color: rgba(232,244,248,0.8);
  font-style: normal;
}
.k2w-prose blockquote p {
  margin: 0;
  color: rgba(232,244,248,0.8);
}

/* HR */
.k2w-prose hr {
  background: linear-gradient(90deg, transparent, #00D4FF, transparent);
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
  color: #E8F4F8;
  line-height: 1.7;
}
.k2w-prose ul li::before {
  content: "▸";
  position: absolute;
  left: 0;
  color: #00D4FF;
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
  color: #E8F4F8;
  line-height: 1.7;
  counter-increment: k2w-counter;
}
.k2w-prose ol li::before {
  content: counter(k2w-counter) ".";
  position: absolute;
  left: 0;
  color: #00D4FF;
  font-weight: 600;
  font-size: 0.9em;
}

/* Tables */
.k2w-prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.95rem;
}
.k2w-prose thead {
  background: rgba(0,212,255,0.08);
}
.k2w-prose th {
  background: rgba(0,212,255,0.12);
  color: #00D4FF;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid rgba(0,212,255,0.3);
}
.k2w-prose td {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  color: #E8F4F8;
}
.k2w-prose tr:hover td {
  background: rgba(0,212,255,0.04);
}

/* Links */
.k2w-prose a {
  color: #00D4FF;
  text-decoration: none;
  border-bottom: 1px solid rgba(0,212,255,0.3);
  transition: border-color 0.2s;
}
.k2w-prose a:hover {
  border-bottom-color: #00D4FF;
}

/* Images */
.k2w-prose img {
  max-width: 100%;
  border-radius: 12px;
  margin: 1.5rem 0;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}
`;

// ─── Custom Renderer ──────────────────────────────────────────────────────────
function createDeepOceanRenderer(): Renderer {
  const renderer = new Renderer();

  // h1-h6 handled by CSS, renderer just adds no extra wrapper
  renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
    return `<h${depth}>${text}</h${depth}>\n`;
  };

  // Code block with optional language tag
  renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
    const escapedCode = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const langTag = lang
      ? `<span class="k2w-lang-tag">${lang}</span>\n`
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
    const parsed = deepOceanMarked.parse(content) as string;
    return `<style>${DEEP_OCEAN_CSS}</style>${parsed}`;
  }, [content]);

  return (
    <div
      className="k2w-prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
