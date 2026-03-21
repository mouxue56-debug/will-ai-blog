import fs from 'fs';
import path from 'path';
import type { BlogPost, BlogCategory } from './blog-types';

export type { BlogPost, BlogCategory, Comment } from './blog-types';
export { CATEGORY_COLORS, CATEGORY_KEYS, ALL_CATEGORIES, getSampleComments } from './blog-types';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

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

  for (const line of frontmatterStr.split('\n')) {
    const trimmed = line.trimEnd();
    if (!trimmed) continue;
    
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
      
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      
      if (value === '') {
        currentObj = {};
      } else {
        data[currentKey] = value.replace(/^["']|["']$/g, '');
        currentObj = null;
      }
    }
  }
  
  if (currentObj !== null && currentKey) {
    data[currentKey] = currentObj;
  }

  return { data, content };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

  const posts = files.map((filename) => {
    const filePath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = parseFrontmatter(fileContent);

    return {
      slug: (data.slug as string) || filename.replace(/\.md$/, ''),
      // Handle both string titles and {zh, ja, en} object titles
      title: (() => {
        const t = data.title as string | Record<string, string>;
        if (!t) return { zh: '', ja: '', en: '' };
        if (typeof t === 'string') return { zh: t, ja: t, en: t };
        return t;
      })(),
      category: (data.category as BlogCategory) || 'ai',
      date: (data.date as string) || '',
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
      tags: typeof data.tags === 'string'
        ? (data.tags as string).split(',').map(tag => tag.trim()).filter(Boolean)
        : Array.isArray(data.tags)
          ? (data.tags as string[]).map(tag => tag.trim()).filter(Boolean)
          : [],
      readingTime: calculateReadingTime(content),
      content,
    } as BlogPost;
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
