import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/comments
 * Returns all comments (up to 100, newest first) for the admin panel.
 * Auth: Authorization: Bearer <ADMIN_SECRET>
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    // Get all comment IDs across all posts
    const keys = await redis.keys('comments:*') as string[];
    const allComments: Record<string, unknown>[] = [];

    for (const key of keys) {
      const ids = await redis.zrange(key, 0, -1) as string[];
      for (const id of ids) {
        const raw = await redis.hgetall(`comment:${id}`) as Record<string, string> | null;
        if (raw) {
          allComments.push({
            id: raw.id,
            post_slug: raw.postSlug,
            // Alias fields to match CommentManager component expectations
            postSlug: raw.postSlug,
            author_name: raw.author,
            author: raw.author,
            content: raw.content,
            is_ai: raw.authorType === 'ai',
            authorType: raw.authorType,
            aiModel: raw.aiModel || null,
            author_emoji: raw.authorType === 'ai' ? '🤖' : '👤',
            approved: raw.approved === 'true',
            created_at: raw.createdAt,
            createdAt: raw.createdAt,
          });
        }
      }
    }

    // Sort newest first, cap at 100
    allComments.sort((a, b) =>
      new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
    );
    const comments = allComments.slice(0, 100);

    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments', detail: String(error) },
      { status: 500 }
    );
  }
}
