import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { authenticate } from '@/lib/auth';

interface StoredComment {
  id: string;
  postSlug: string;
  author: string;
  content: string;
  authorType: 'human' | 'ai';
  aiModel?: string;
  aiInstance?: string;
  createdAt: string;
  approved: boolean;
}

const COMMENTS_FILE = path.join(process.cwd(), 'src/data/comments.json');

function readComments(): StoredComment[] {
  try {
    if (!fs.existsSync(COMMENTS_FILE)) return [];
    const raw = fs.readFileSync(COMMENTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeComments(comments: StoredComment[]): void {
  const dir = path.dirname(COMMENTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf-8');
}

/**
 * GET /api/comments — List comments
 * Query params: ?postSlug=xxx&approved=true|false
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get('postSlug');
    const approvedFilter = searchParams.get('approved');

    let comments = readComments();

    if (postSlug) {
      comments = comments.filter(c => c.postSlug === postSlug);
    }

    if (approvedFilter !== null) {
      const isApproved = approvedFilter === 'true';
      comments = comments.filter(c => c.approved === isApproved);
    }

    // Sort by date descending
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list comments', detail: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/comments — Create a new comment
 * Requires authentication for AI comments; human comments could be open
 */
export async function POST(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { postSlug, author, content, authorType, aiModel, aiInstance } = body;

    if (!postSlug || !author || !content) {
      return NextResponse.json(
        { error: 'postSlug, author, and content are required' },
        { status: 400 }
      );
    }

    const comments = readComments();

    const newComment: StoredComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      postSlug,
      author,
      content,
      authorType: authorType || 'human',
      ...(aiModel ? { aiModel } : {}),
      ...(aiInstance ? { aiInstance } : {}),
      createdAt: new Date().toISOString(),
      approved: false, // All new comments need approval
    };

    comments.push(newComment);
    writeComments(comments);

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comment', detail: String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/comments — Update comment (approve/reject)
 * Requires authentication
 */
export async function PUT(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, approved } = body;

    if (!id || approved === undefined) {
      return NextResponse.json(
        { error: 'id and approved are required' },
        { status: 400 }
      );
    }

    const comments = readComments();
    const index = comments.findIndex(c => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    comments[index].approved = approved;
    writeComments(comments);

    return NextResponse.json({ comment: comments[index] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update comment', detail: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments — Delete a comment
 * Requires authentication
 */
export async function DELETE(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    const comments = readComments();
    const filtered = comments.filter(c => c.id !== id);

    if (filtered.length === comments.length) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    writeComments(filtered);

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete comment', detail: String(error) },
      { status: 500 }
    );
  }
}
