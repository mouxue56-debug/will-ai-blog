import fs from 'fs';
import path from 'path';
import type { BlogPost, BlogCategory, BlogContentSource } from './blog-types';

export type { BlogPost, BlogCategory, Comment } from './blog-types';
export { CATEGORY_COLORS, CATEGORY_KEYS, ALL_CATEGORIES, getSampleComments } from './blog-types';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const ORIGINAL_CONTENT_CUTOFF = '2026-03-15';

function getContentSource(date: string): BlogContentSource {
  return date >= ORIGINAL_CONTENT_CUTOFF ? 'original' : 'ai-organized';
}

function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateReadingTime(content: string): number {
  const plainText = stripMarkdown(content);
  const cjkChars = (plainText.match(/[\u3400-\u9FFF\uF900-\uFAFF]/g) || []).length;
  const englishWords = (plainText.match(/\b[a-zA-Z][a-zA-Z'-]*\b/g) || []).length;

  if (cjkChars > englishWords) {
    return Math.max(1, Math.ceil(cjkChars / 400));
  }

  return Math.max(1, Math.ceil(englishWords / 200));
}

function parseFrontmatter(fileContent: string): { data: Record<string, unknown>; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);
  
  if (!match) {
    return { data: {}, content: fileContent };
  }

  const frontmatterStr = match[1];
  const content = match[2];
  const data: Record<string, unknown> = {};

  let currentKey = '';
  let currentObj: Record<string, string> | null = null;
  let currentList: Array<Record<string, string>> | null = null;
  let currentListItem: Record<string, string> | null = null;

  for (const line of frontmatterStr.split('\n')) {
    const trimmed = line.trimEnd();
    if (!trimmed) continue;
    
    // Check for list item start: "  - key: value" or "  - value"
    const listItemMatch = trimmed.match(/^\s+-\s+(.*)$/);
    if (listItemMatch && currentList !== null) {
      const itemContent = listItemMatch[1];
      // Check if it's a key-value pair
      const itemKvMatch = itemContent.match(/^([\w]+):\s*(.*)$/);
      if (itemKvMatch) {
        currentListItem = { [itemKvMatch[1]]: itemKvMatch[2].replace(/^["']|["']$/g, '') };
        currentList.push(currentListItem);
      } else {
        // Simple list item
        currentList.push({ value: itemContent.replace(/^["']|["']$/g, '') });
      }
      continue;
    }
    
    // Check for continuation of list item (indented key-value)
    const listItemContinuation = trimmed.match(/^\s{4,}([\w]+):\s*(.*)$/);
    if (listItemContinuation && currentListItem !== null && currentList !== null) {
      currentListItem[listItemContinuation[1]] = listItemContinuation[2].replace(/^["']|["']$/g, '');
      continue;
    }
    
    const nestedMatch = trimmed.match(/^\s+([\w]+):\s*(.+)$/);
    if (nestedMatch && currentObj !== null) {
      const value = nestedMatch[2].replace(/^["']|["']$/g, '');
      currentObj[nestedMatch[1]] = value;
      continue;
    }

    const kvMatch = trimmed.match(/^([\w]+):\s*(.*)$/);
    if (kvMatch) {
      if (currentObj !== null && currentKey) {
        data[currentKey] = currentObj;
        currentObj = null;
      }
      if (currentList !== null && currentKey) {
        data[currentKey] = currentList;
        currentList = null;
        currentListItem = null;
      }
      
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      
      if (value === '') {
        // Check if next lines are list items
        currentList = [];
        currentObj = null;
      } else {
        data[currentKey] = value.replace(/^["']|["']$/g, '');
        currentObj = null;
        currentList = null;
      }
    }
  }
  
  if (currentObj !== null && currentKey) {
    data[currentKey] = currentObj;
  }
  if (currentList !== null && currentKey) {
    data[currentKey] = currentList;
  }

  return { data, content };
}

function getSafeDateValue(date: string): number {
  const timestamp = Date.parse(date);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  const posts = files.map((filename) => {
    const filePath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = parseFrontmatter(fileContent);
    const date = (data.date as string) || '';

    return {
      slug: (data.slug as string) || filename.replace(/\.md$/, ''),
      // Handle both string titles and {zh, ja, en} object titles
      title: (() => {
        const t = data.title as string | Record<string, string>;
        if (!t) return { zh: '', ja: '', en: '' };
        if (typeof t === 'string') return { zh: t, ja: t, en: t };
        return t;
      })(),
      category: (['ai','tech','life','cats','business','learning'].includes(data.category as string)
        ? (data.category as BlogCategory)
        : 'ai'),
      contentSource: getContentSource(date),
      date,
      updated: (data.updated as string) || '',
      author: (data.author as string) || 'Will',
      locale: (data.locale as string) || 'zh',
      coverImage: (data.coverImage as string) || '',
      // Handle both string excerpts and {zh, ja, en} object excerpts
      excerpt: (() => {
        const e = data.excerpt as string | Record<string, string>;
        if (!e) return { zh: '', ja: '', en: '' };
        if (typeof e === 'string') return { zh: e, ja: e, en: e };
        return e;
      })(),
      tags: (() => {
        const t = data.tags;
        if (!t) return [];
        if (Array.isArray(t)) return (t as string[]).map((tag: string) => tag.trim()).filter(Boolean);
        // Guard: YAML list becomes {} (empty object) since our parser doesn't handle list syntax
        if (typeof t !== 'string') return [];
        const s = t as string;
        // Handle JSON array strings like ["ai", "tech"] from frontmatter
        if (s.startsWith('[')) {
          try {
            const parsed = JSON.parse(s) as string[];
            if (Array.isArray(parsed)) return parsed.map((tag: string) => tag.trim()).filter(Boolean);
          } catch { /* fall through to CSV */ }
        }
        return s.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      })(),
      readingTime: calculateReadingTime(content),
      content,
      willComment: (data.willComment as Record<string, string>) || undefined,
      audioUrl: (data.audioUrl as string) || undefined,
      layout: (data.layout as 'default' | 'enhanced') || undefined,
      sections: (data.sections as Array<{ id: string; title: string }>) || undefined,
    } as BlogPost;
  });

  return posts.sort((a, b) => getSafeDateValue(b.date) - getSafeDateValue(a.date));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find(p => p.slug === slug) || null;
}

export function getAdjacentPosts(slug: string): { prev: BlogPost | null; next: BlogPost | null } {
  const posts = getAllPosts();
  const index = posts.findIndex(p => p.slug === slug);
  
  if (index === -1) return { prev: null, next: null };
  
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllPosts().filter(p => p.category === category);
}
