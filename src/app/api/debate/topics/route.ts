import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { debates } from '@/data/debates';

export const runtime = 'edge';

// GET /api/debate/topics — return today's topics (Redis + static fallback)
export async function GET() {
  try {
    const redis = getRedis();
    if (redis) {
      const keys = await redis.keys('debate:topic:*');
      if (keys.length > 0) {
        const topics = await Promise.all(
          keys.map((k) => redis.hgetall(k))
        );
        return NextResponse.json({ topics: topics.filter(Boolean) });
      }
    }
    // Fallback to static data
    return NextResponse.json({
      topics: debates.map((d) => ({
        id: d.id,
        date: d.date,
        session: d.session,
        topic: d.topic,
        newsSource: d.newsSource,
        tags: d.tags,
        opinionCount: d.aiOpinions.length,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

// POST /api/debate/topics — create new topic (admin only)
export async function POST(req: Request) {
  try {
    const adminKey = process.env.DEBATE_ADMIN_KEY;
    const providedKey = req.headers.get('x-admin-key');
    if (!adminKey || providedKey !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, date, session, topic, newsSource, tags } = body;

    if (!id || !date || !session || !topic?.zh || !newsSource) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 503 });
    }

    await redis.hset(`debate:topic:${id}`, {
      id, date, session,
      topic: JSON.stringify(topic),
      newsSource,
      tags: JSON.stringify(tags || []),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
