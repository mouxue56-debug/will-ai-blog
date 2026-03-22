import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { authenticate } from '@/lib/auth';

const BLOG_DIR = path.resolve(process.cwd(), 'src/content/blog');

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80) || `post-${Date.now()}`;
}

function parseFrontmatter(fileContent: string): { data: Record<string, string>; content: string } {
  const match = fileContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {}, content: fileContent };

  const data: Record<string, string> = {};
  let currentKey = '';
  let inNested = false;
  const nestedObj: Record<string, string> = {};

  for (const line of match[1].split('\n')) {
    const trimmed = line.trimEnd();
    if (!trimmed) continue;

    const nestedMatch = trimmed.match(/^\s+([\w]+):\s*(.+)$/);
    if (nestedMatch && inNested) {
      nestedObj[nestedMatch[1]] = nestedMatch[2].replace(/^["']|["']$/g, '');
      continue;
    }

    if (inNested && currentKey) {
      data[currentKey] = JSON.stringify(nestedObj);
      inNested = false;
    }

    const kvMatch = trimmed.match(/^([\w]+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value === '') {
        inNested = true;
        Object.keys(nestedObj).forEach(k => delete nestedObj[k]);
      } else {
        data[currentKey] = value.replace(/^["']|["']$/g, '');
        inNested = false;
      }
    }
  }

  if (inNested && currentKey) {
    data[currentKey] = JSON.stringify(nestedObj);
  }

  return { data, content: match[2] };
}

/**
 * GET /api/posts — List all posts with optional filters
 * Query params: ?status=draft|published&category=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const categoryFilter = searchParams.get('category');

    if (!fs.existsSync(BLOG_DIR)) {
      return NextResponse.json({ posts: [] });
    }

    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

    let posts = files.map((filename) => {
      const filePath = path.join(BLOG_DIR, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = parseFrontmatter(fileContent);

      return {
        slug: data.slug || filename.replace(/\.md$/, ''),
        title: data.title || '{}',
        category: data.category || 'ai',
        date: data.date || '',
        author: data.author || 'Will',
        authorType: data.authorType || 'human',
        aiModel: data.aiModel || undefined,
        locale: data.locale || 'zh',
        status: data.status || 'published',
        excerpt: data.excerpt || '{}',
        contentLength: content.length,
      };
    });

    // Apply filters
    if (statusFilter) {
      posts = posts.filter(p => p.status === statusFilter);
    }
    if (categoryFilter) {
      posts = posts.filter(p => p.category === categoryFilter);
    }

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list posts', detail: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts — Create a new draft post
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  // Auth check
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, content, category, tags, locale, author, authorType, aiModel } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title (use English title if it's an object, otherwise the string)
    const titleStr = typeof title === 'object' ? (title.en || title.zh || title.ja || 'untitled') : title;
    let slug = slugify(titleStr);

    // Ensure uniqueness
    const existing = path.join(BLOG_DIR, `${slug}.md`);
    if (fs.existsSync(existing)) {
      slug = `${slug}-${Date.now()}`;
    }

    // Build frontmatter
    const titleBlock = typeof title === 'object'
      ? `title:\n  zh: "${title.zh || ''}"\n  ja: "${title.ja || ''}"\n  en: "${title.en || ''}"`
      : `title:\n  zh: "${title}"\n  ja: ""\n  en: ""`;

    const excerptStr = typeof content === 'string' ? content.substring(0, 120).replace(/\n/g, ' ') : '';
    const tagsStr = Array.isArray(tags) ? tags.join(', ') : (tags || '');

    const frontmatter = [
      '---',
      `slug: ${slug}`,
      titleBlock,
      `category: ${category || 'ai'}`,
      `date: "${new Date().toISOString().split('T')[0]}"`,
      `author: ${author || 'AI'}`,
      `authorType: ${authorType || 'ai'}`,
      ...(aiModel ? [`aiModel: ${aiModel}`] : []),
      `locale: ${locale || 'zh'}`,
      `status: draft`,
      ...(tagsStr ? [`tags: ${tagsStr}`] : []),
      `excerpt:`,
      `  zh: "${excerptStr}"`,
      `  ja: ""`,
      `  en: ""`,
      `readingTime: ${Math.max(1, Math.ceil(content.length / 500))}`,
      '---',
      '',
    ].join('\n');

    const fileContent = frontmatter + (typeof content === 'string' ? content : '');

    // Write file — verify resolved path is within BLOG_DIR (path traversal guard)
    if (!fs.existsSync(BLOG_DIR)) {
      fs.mkdirSync(BLOG_DIR, { recursive: true });
    }

    const targetPath = path.resolve(BLOG_DIR, `${slug}.md`);
    if (!targetPath.startsWith(BLOG_DIR + path.sep) && targetPath !== BLOG_DIR) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    fs.writeFileSync(targetPath, fileContent, 'utf-8');

    return NextResponse.json({ slug, status: 'draft' }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post', detail: String(error) },
      { status: 500 }
    );
  }
}
