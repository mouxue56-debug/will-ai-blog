import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { authenticate } from '@/lib/auth';

const BLOG_DIR = path.resolve(process.cwd(), 'src/content/blog');
const TRASH_DIR = path.resolve(BLOG_DIR, '_trash');

type RouteContext = { params: Promise<{ slug: string }> };

const VALID_STATUSES = ['draft', 'published', 'archived'] as const;
type PostStatus = (typeof VALID_STATUSES)[number];

/**
 * Sanitize a slug to prevent path traversal attacks.
 * Only allows alphanumeric characters, hyphens, underscores, and CJK characters.
 * Strips any path separators or dot sequences.
 */
function sanitizeSlug(slug: string): string {
  return slug
    .replace(/[^a-zA-Z0-9\-_\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g, '')
    .slice(0, 100);
}

function findPostFile(slug: string): string | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  // Sanitize slug to prevent path traversal
  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) return null;

  const direct = path.resolve(BLOG_DIR, `${safeSlug}.md`);
  // Extra guard: verify resolved path is within BLOG_DIR
  if (!direct.startsWith(BLOG_DIR + path.sep) && direct !== BLOG_DIR) {
    return null;
  }
  if (fs.existsSync(direct)) return direct;

  // Search by slug in frontmatter (files are already enumerated from BLOG_DIR)
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  for (const f of files) {
    const filePath = path.resolve(BLOG_DIR, f);
    // Guard: ensure file is within BLOG_DIR (no symlink escapes)
    if (!filePath.startsWith(BLOG_DIR + path.sep)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^slug:\s*(.+)$/m);
    if (match && match[1].trim() === safeSlug) {
      return filePath;
    }
  }
  return null;
}

/**
 * GET /api/posts/[slug] — Get a single post
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const filePath = findPostFile(slug);

    if (!filePath) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fmMatch = fileContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    
    return NextResponse.json({
      slug,
      raw: fileContent,
      frontmatter: fmMatch ? fmMatch[1] : '',
      content: fmMatch ? fmMatch[2] : fileContent,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get post', detail: String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts/[slug] — Update a post (content, status, etc.)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const { slug } = await context.params;
    const filePath = findPostFile(slug);

    if (!filePath) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Request body must be an object' }, { status: 400 });
    }

    let fileContent = fs.readFileSync(filePath, 'utf-8');

    // Update status if provided — must be an allowlisted value to prevent YAML injection
    if (body.status !== undefined) {
      if (typeof body.status !== 'string' || !(VALID_STATUSES as readonly string[]).includes(body.status)) {
        return NextResponse.json(
          { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }
      const safeStatus = body.status as PostStatus;
      if (fileContent.match(/^status:\s*.+$/m)) {
        fileContent = fileContent.replace(/^status:\s*.+$/m, `status: ${safeStatus}`);
      } else {
        fileContent = fileContent.replace(
          /^(date:\s*.+)$/m,
          `$1\nstatus: ${safeStatus}`
        );
      }
    }

    // Update content if provided
    if (body.content !== undefined) {
      if (typeof body.content !== 'string') {
        return NextResponse.json({ error: 'content must be a string' }, { status: 400 });
      }
      const fmMatch = fileContent.match(/^(---\s*\n[\s\S]*?\n---\s*\n)([\s\S]*)$/);
      if (fmMatch) {
        fileContent = fmMatch[1] + body.content;
      }
    }

    // Update title if provided
    if (body.title !== undefined) {
      if (typeof body.title === 'object' && body.title !== null) {
        const t = body.title as Record<string, unknown>;
        const zh = typeof t.zh === 'string' ? t.zh : '';
        const ja = typeof t.ja === 'string' ? t.ja : '';
        const en = typeof t.en === 'string' ? t.en : '';
        fileContent = fileContent.replace(
          /^title:\n(\s+\w+:.*\n)*/m,
          `title:\n  zh: "${zh}"\n  ja: "${ja}"\n  en: "${en}"\n`
        );
      }
    }

    fs.writeFileSync(filePath, fileContent, 'utf-8');

    return NextResponse.json({ slug, status: body.status ?? 'updated', message: 'Post updated' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update post', detail: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[slug] — Move post to _trash/
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const { slug } = await context.params;
    const filePath = findPostFile(slug);

    if (!filePath) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Move to _trash/
    if (!fs.existsSync(TRASH_DIR)) {
      fs.mkdirSync(TRASH_DIR, { recursive: true });
    }

    const filename = path.basename(filePath);
    const trashPath = path.join(TRASH_DIR, `${Date.now()}-${filename}`);
    fs.renameSync(filePath, trashPath);

    return NextResponse.json({ slug, message: 'Post moved to trash' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete post', detail: String(error) },
      { status: 500 }
    );
  }
}
