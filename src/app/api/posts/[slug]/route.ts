import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { authenticate } from '@/lib/auth';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const TRASH_DIR = path.join(BLOG_DIR, '_trash');

type RouteContext = { params: Promise<{ slug: string }> };

function findPostFile(slug: string): string | null {
  if (!fs.existsSync(BLOG_DIR)) return null;
  const direct = path.join(BLOG_DIR, `${slug}.md`);
  if (fs.existsSync(direct)) return direct;

  // Search by slug in frontmatter
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  for (const f of files) {
    const content = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8');
    const match = content.match(/^slug:\s*(.+)$/m);
    if (match && match[1].trim() === slug) {
      return path.join(BLOG_DIR, f);
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

    const body = await request.json();
    let fileContent = fs.readFileSync(filePath, 'utf-8');

    // Update status if provided
    if (body.status) {
      if (fileContent.match(/^status:\s*.+$/m)) {
        fileContent = fileContent.replace(/^status:\s*.+$/m, `status: ${body.status}`);
      } else {
        // Insert status after date line
        fileContent = fileContent.replace(
          /^(date:\s*.+)$/m,
          `$1\nstatus: ${body.status}`
        );
      }
    }

    // Update content if provided
    if (body.content !== undefined) {
      const fmMatch = fileContent.match(/^(---\s*\n[\s\S]*?\n---\s*\n)([\s\S]*)$/);
      if (fmMatch) {
        fileContent = fmMatch[1] + body.content;
      }
    }

    // Update title if provided
    if (body.title) {
      if (typeof body.title === 'object') {
        // Replace title block
        fileContent = fileContent.replace(
          /^title:\n(\s+\w+:.*\n)*/m,
          `title:\n  zh: "${body.title.zh || ''}"\n  ja: "${body.title.ja || ''}"\n  en: "${body.title.en || ''}"\n`
        );
      }
    }

    fs.writeFileSync(filePath, fileContent, 'utf-8');

    return NextResponse.json({ slug, status: body.status || 'updated', message: 'Post updated' });
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
