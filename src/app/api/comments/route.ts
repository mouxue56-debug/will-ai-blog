import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { auth } from '@/lib/auth-config';
import { getRedis } from '@/lib/redis';
import { filterContent } from '@/lib/rate-limit';

interface StoredComment {
  id: string;
  postSlug: string;
  author: string;
  content: string;
  authorType: 'human' | 'ai' | 'guest' | 'admin';
  aiModel?: string;
  aiInstance?: string;
  createdAt: string;
  approved: boolean;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// Redis-based storage
async function redisGetComments(postSlug?: string): Promise<StoredComment[]> {
  const redis = getRedis();
  if (!redis) return [];

  try {
    if (postSlug) {
      const ids = await redis.zrange(`comments:${postSlug}`, 0, -1, { withScores: true }) as string[];
      if (!ids || ids.length === 0) return [];
      const comments: StoredComment[] = [];
      for (let i = 0; i < ids.length; i += 2) {
        const id = ids[i];
        const raw = await redis.hgetall(`comment:${id}`) as Record<string, string> | null;
        if (raw) {
          comments.push({
            id: raw.id,
            postSlug: raw.postSlug,
            author: raw.author,
            content: raw.content,
            authorType: raw.authorType as StoredComment['authorType'],
            createdAt: raw.createdAt,
            approved: raw.approved === 'true',
            ...(raw.aiModel ? { aiModel: raw.aiModel } : {}),
            ...(raw.aiInstance ? { aiInstance: raw.aiInstance } : {}),
          });
        }
      }
      return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Get all comment IDs across all posts
      const keys = await redis.keys('comments:*');
      const allComments: StoredComment[] = [];
      for (const key of keys) {
        const ids = await redis.zrange(key, 0, -1) as string[];
        for (const id of ids) {
          const raw = await redis.hgetall(`comment:${id}`) as Record<string, string> | null;
          if (raw) {
            allComments.push({
              id: raw.id,
              postSlug: raw.postSlug,
              author: raw.author,
              content: raw.content,
              authorType: raw.authorType as StoredComment['authorType'],
              createdAt: raw.createdAt,
              approved: raw.approved === 'true',
              ...(raw.aiModel ? { aiModel: raw.aiModel } : {}),
              ...(raw.aiInstance ? { aiInstance: raw.aiInstance } : {}),
            });
          }
        }
      }
      return allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch {
    return [];
  }
}

async function redisSaveComment(comment: StoredComment): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const record: Record<string, string> = {
    id: comment.id,
    postSlug: comment.postSlug,
    author: comment.author,
    content: comment.content,
    authorType: comment.authorType,
    createdAt: comment.createdAt,
    approved: String(comment.approved),
    ...(comment.aiModel ? { aiModel: comment.aiModel } : {}),
    ...(comment.aiInstance ? { aiInstance: comment.aiInstance } : {}),
  };
  await redis.hset(`comment:${comment.id}`, record);
  await redis.zadd(`comments:${comment.postSlug}`, { score: new Date(comment.createdAt).getTime(), member: comment.id });
}

async function redisDeleteComment(id: string, postSlug: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.zrem(`comments:${postSlug}`, id);
  await redis.del(`comment:${id}`);
}

// Guest rate limit: 5 comments per day per IP
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis();
  if (!redis) return { allowed: true, remaining: 5 };

  const key = `ratelimit:comment:${ip}:${getTodayKey()}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 86400); // Expire after 24h
    }
    const remaining = Math.max(0, 5 - count);
    return { allowed: count <= 5, remaining };
  } catch {
    return { allowed: true, remaining: 5 };
  }
}

async function sendTelegramNotification(comment: StoredComment): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: '6744771747',
        text: `📝 新评论待审核

文章: ${comment.postSlug}
作者: ${comment.author}
内容: ${comment.content.slice(0, 150)}${comment.content.length > 150 ? '...' : ''}

👉 https://aiblog.fuluckai.com/zh/blog/${comment.postSlug}#comments`,
      }),
    });
  } catch {
    // Silently fail - don't影响主流程
  }
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

    let comments = await redisGetComments(postSlug || undefined);

    if (approvedFilter !== null) {
      const isApproved = approvedFilter === 'true';
      comments = comments.filter(c => c.approved === isApproved);
    }

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
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = session?.user && (session.user as Record<string, unknown>).role === 'admin';

    if (!session) {
      const authError = authenticate(request);
      const body = await request.clone().json();
      if (body.authorType === 'ai' && authError) {
        return authError;
      }
    }

    const body = await request.json();
    const { postSlug, author, content, authorType, aiModel, aiInstance } = body;

    if (!postSlug || !content) {
      return NextResponse.json(
        { error: 'postSlug and content are required' },
        { status: 400 }
      );
    }

    // 内容过滤（敏感词 + 长度 + 重复检测）
    const filter = filterContent(content);
    if (!filter.ok) {
      return NextResponse.json({ error: filter.reason }, { status: 400 });
    }

    let commentAuthor = author;
    let commentAuthorType = authorType || 'human';

    if (session?.user) {
      commentAuthor = author || session.user.name || 'User';
      if (isAdmin) commentAuthorType = 'admin';
    } else if (!author) {
      commentAuthor = 'Guest';
      commentAuthorType = 'guest';
    } else if (!authorType || authorType === 'human') {
      commentAuthorType = 'guest';
    }

    // Guest rate limiting
    if (commentAuthorType === 'guest') {
      const ip = getClientIp(request);
      const { allowed } = await checkRateLimit(ip);
      if (!allowed) {
        return NextResponse.json(
          {
            error: '今天评论次数已用完',
            detail: '每位游客每天最多发5条评论，明天再来吧～',
            remaining: 0,
          },
          { status: 429 }
        );
      }
    }

    const newComment: StoredComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      postSlug,
      author: commentAuthor,
      content,
      authorType: commentAuthorType as StoredComment['authorType'],
      ...(aiModel ? { aiModel } : {}),
      ...(aiInstance ? { aiInstance } : {}),
      createdAt: new Date().toISOString(),
      approved: isAdmin ? true : (session?.user && commentAuthorType !== 'guest') ? true : false,
    };

    await redisSaveComment(newComment);

    // Notify on pending guest comments
    if (commentAuthorType === 'guest' && !newComment.approved) {
      sendTelegramNotification(newComment);
    }

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
 */
export async function PUT(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, postSlug, approved } = body;

    if (!id || approved === undefined || !postSlug) {
      return NextResponse.json(
        { error: 'id, postSlug, and approved are required' },
        { status: 400 }
      );
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const existing = await redis.hgetall(`comment:${id}`) as StoredComment | null;
    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    existing.approved = approved;
    const record: Record<string, string> = {
      id: existing.id,
      postSlug: existing.postSlug,
      author: existing.author,
      content: existing.content,
      authorType: existing.authorType,
      createdAt: existing.createdAt,
      approved: String(approved),
      ...(existing.aiModel ? { aiModel: existing.aiModel } : {}),
      ...(existing.aiInstance ? { aiInstance: existing.aiInstance } : {}),
    };
    await redis.hset(`comment:${id}`, record);

    return NextResponse.json({ comment: existing });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update comment', detail: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments — Delete a comment
 */
export async function DELETE(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const postSlug = searchParams.get('postSlug');

    if (!id || !postSlug) {
      return NextResponse.json(
        { error: 'id and postSlug query parameters are required' },
        { status: 400 }
      );
    }

    await redisDeleteComment(id, postSlug);

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete comment', detail: String(error) },
      { status: 500 }
    );
  }
}
