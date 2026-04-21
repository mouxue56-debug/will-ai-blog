'use client';

import { Marked, Renderer } from 'marked';
import { useMemo } from 'react';

const CASE_PROSE_CSS = `
.case-prose {
  color: hsl(var(--muted-foreground));
  line-height: 1.75;
  font-size: 0.975rem;
}

.case-prose h2 {
  color: hsl(var(--foreground));
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 1.75rem 0 0.75rem;
  padding-left: 0.75rem;
  border-left: 3px solid var(--color-brand-mint);
  line-height: 1.35;
}
.case-prose h2:first-child { margin-top: 0.25rem; }

.case-prose h3 {
  color: hsl(var(--foreground));
  font-size: 1rem;
  font-weight: 600;
  margin: 1.35rem 0 0.55rem;
  line-height: 1.4;
}
.case-prose h4, .case-prose h5, .case-prose h6 {
  color: hsl(var(--foreground));
  font-size: 0.975rem;
  font-weight: 600;
  margin: 1.15rem 0 0.45rem;
}

.case-prose p {
  margin: 0 0 0.9rem;
}
.case-prose p:last-child { margin-bottom: 0; }

.case-prose strong {
  color: hsl(var(--foreground));
  font-weight: 600;
}
.case-prose em {
  font-style: italic;
  color: hsl(var(--foreground) / 0.9);
}

.case-prose code {
  background: color-mix(in srgb, var(--color-brand-mint) 14%, transparent);
  color: var(--color-brand-mint-dark, #5BC4A8);
  padding: 1px 6px;
  border-radius: 5px;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace;
  font-size: 0.85em;
  letter-spacing: -0.01em;
}

.case-prose pre {
  background: hsl(var(--secondary) / 0.3);
  border: 1px solid hsl(var(--border) / 0.5);
  border-radius: 10px;
  padding: 14px 16px;
  overflow-x: auto;
  margin: 1.1rem 0;
}
.case-prose pre code {
  background: none;
  color: hsl(var(--foreground));
  padding: 0;
  font-size: 0.85rem;
}

.case-prose blockquote {
  background: color-mix(in srgb, var(--color-brand-mint) 8%, transparent);
  border-left: 3px solid color-mix(in srgb, var(--color-brand-mint) 60%, transparent);
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
  margin: 1rem 0;
  color: hsl(var(--foreground) / 0.85);
}
.case-prose blockquote p { margin: 0; }

.case-prose hr {
  background: linear-gradient(90deg, transparent, hsl(var(--border)), transparent);
  height: 1px;
  border: none;
  margin: 1.5rem 0;
}

.case-prose ul {
  margin: 0.6rem 0 1rem;
  padding-left: 1.25rem;
  list-style: none;
}
.case-prose ul li {
  position: relative;
  padding-left: 1rem;
  margin-bottom: 0.35rem;
  line-height: 1.65;
}
.case-prose ul li::before {
  content: "◦";
  position: absolute;
  left: 0;
  color: var(--color-brand-mint);
  font-weight: 700;
  top: -0.05em;
}

.case-prose ol {
  margin: 0.6rem 0 1rem;
  padding-left: 1.75rem;
  list-style: decimal;
}
.case-prose ol li {
  margin-bottom: 0.35rem;
  line-height: 1.65;
  padding-left: 0.35rem;
}
.case-prose ol li::marker {
  color: var(--color-brand-mint);
  font-weight: 600;
}

.case-prose li > ul, .case-prose li > ol { margin: 0.35rem 0 0.35rem; }

.case-prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.1rem 0;
  font-size: 0.925rem;
}
.case-prose th {
  background: color-mix(in srgb, var(--color-brand-mint) 10%, transparent);
  color: hsl(var(--foreground));
  padding: 9px 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid hsl(var(--border));
}
.case-prose td {
  padding: 8px 12px;
  border-bottom: 1px solid hsl(var(--border) / 0.5);
}

.case-prose a {
  color: var(--color-brand-mint-dark, #5BC4A8);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--color-brand-mint) 40%, transparent);
  text-underline-offset: 2px;
  transition: text-decoration-color 0.15s, color 0.15s;
}
.case-prose a:hover {
  text-decoration-color: var(--color-brand-mint);
  color: var(--color-brand-mint);
}
`;

function createCaseRenderer(): Renderer {
  const r = new Renderer();
  r.heading = ({ text, depth }: { text: string; depth: number }) =>
    `<h${depth}>${text}</h${depth}>\n`;
  r.code = ({ text, lang }: { text: string; lang?: string }) => {
    const esc = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code${lang ? ` class="language-${lang}"` : ''}>${esc}</code></pre>\n`;
  };
  r.link = ({ href, title, tokens }: { href: string; title?: string | null; tokens: { raw?: string; text?: string }[] }) => {
    const text = tokens.map((t) => t.text ?? t.raw ?? '').join('');
    const ext = /^https?:\/\//.test(href);
    const titleAttr = title ? ` title="${title}"` : '';
    const extAttr = ext ? ` target="_blank" rel="noopener noreferrer"` : '';
    return `<a href="${href}"${titleAttr}${extAttr}>${text}</a>`;
  };
  return r;
}

const caseMarked = new Marked({
  gfm: true,
  breaks: false,
  async: false,
  renderer: createCaseRenderer(),
});

export function CaseMarkdown({ content }: { content: string }) {
  const html = useMemo(() => {
    if (!content) return '';
    const parsed = caseMarked.parse(content) as string;
    return `<style>${CASE_PROSE_CSS}</style>${parsed}`;
  }, [content]);

  return (
    <div
      className="case-prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
