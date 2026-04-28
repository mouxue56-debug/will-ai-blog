import fs from 'fs';
import path from 'path';

import type { Locale } from './locale';

export interface DigestEntry {
  date: string;
  slug: string;
  title: Record<Locale, string>;
  sources: string[];
  tags: string[];
  willComment: Record<Locale, string>;
  summary: string;
}

const DIGEST_DIR = path.join(process.cwd(), 'src/content/digest');

function parseInlineArray(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return [];
  }

  return trimmed
    .slice(1, -1)
    .split(',')
    .map((item) => item.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

function parseFrontmatter(fileContent: string): { data: Record<string, unknown>; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content: fileContent.trim() };
  }

  const frontmatterStr = match[1];
  const content = match[2].trim();
  const data: Record<string, unknown> = {};

  let currentKey = '';
  let currentObj: Record<string, string> | null = null;

  for (const rawLine of frontmatterStr.split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    const nestedMatch = line.match(/^\s+([\w]+):\s*(.+)$/);
    if (nestedMatch && currentObj !== null) {
      currentObj[nestedMatch[1]] = nestedMatch[2].replace(/^["']|["']$/g, '');
      continue;
    }

    const kvMatch = line.match(/^([\w]+):\s*(.*)$/);
    if (!kvMatch) continue;

    if (currentObj !== null && currentKey) {
      data[currentKey] = currentObj;
      currentObj = null;
    }

    currentKey = kvMatch[1];
    const value = kvMatch[2].trim();

    if (value === '') {
      currentObj = {};
      continue;
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      data[currentKey] = parseInlineArray(value);
      continue;
    }

    data[currentKey] = value.replace(/^["']|["']$/g, '');
  }

  if (currentObj !== null && currentKey) {
    data[currentKey] = currentObj;
  }

  return { data, content };
}

export function getAllDigests(): DigestEntry[] {
  if (!fs.existsSync(DIGEST_DIR)) {
    return [];
  }

  const files = fs.readdirSync(DIGEST_DIR).filter((file) => file.endsWith('.md'));

  return files
    .map((filename) => {
      const filePath = path.join(DIGEST_DIR, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = parseFrontmatter(fileContent);

      return {
        date: (data.date as string) || '',
        slug: (data.slug as string) || filename.replace(/\.md$/, ''),
        title: (data.title as Record<Locale, string>) || { zh: '', ja: '', en: '' },
        sources: Array.isArray(data.sources) ? (data.sources as string[]) : [],
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        willComment: (data.willComment as Record<Locale, string>) || { zh: '', ja: '', en: '' },
        summary: content,
      } satisfies DigestEntry;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
