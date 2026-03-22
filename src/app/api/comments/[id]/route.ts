import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/comments/[id]
 * Admin-only endpoint to delete a comment by ID.
 * Auth: Authorization: Bearer <ADMIN_SECRET>
 *
 * Note: This endpoint looks up the comment's postSlug from Redis automatically,
 * so callers don't need to supply it separately.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Admin verification via ADMIN_SECRET env var
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    // Look up the comment to get its postSlug (needed to remove from sorted set)
    const raw = await redis.hgetall(`comment:${id}`) as Record<string, string> | null;

    if (!raw) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const postSlug = raw.postSlug;

    // Remove from sorted set and delete hash
    await redis.zrem(`comments:${postSlug}`, id);
    await redis.del(`comment:${id}`);

    return NextResponse.json({ ok: true, deleted: id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete comment', detail: String(error) },
      { status: 500 }
    );
  }
}
