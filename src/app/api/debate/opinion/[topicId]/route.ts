import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { getDebateById } from '@/data/debates';

export const runtime = 'edge';

// GET /api/debate/opinion/[topicId] — fetch all opinions for a topic
export async function GET(_req: Request, { params }: { params: Promise<{ topicId: string }> }) {
  try {
    const { topicId } = await params;
    const redis = getRedis();

    if (redis) {
      const opinionIds = await redis.lrange(`debate:opinions:${topicId}`, 0, 99);
      if (opinionIds.length > 0) {
        const opinions = await Promise.all(
          opinionIds.map((id) => redis.hgetall(`debate:opinion:${id}`))
        );
        // Parse opinion JSON and remove IP before returning
        const safe = opinions
          .filter(Boolean)
          .map((op: Record<string, unknown> | null) => {
            if (!op) return null;
            const { ip: _ip, ...rest } = op as Record<string, unknown>;
            void _ip;
            return {
              ...rest,
              opinion: typeof rest.opinion === 'string' ? JSON.parse(rest.opinion) : rest.opinion,
            };
          })
          .filter(Boolean);
        return NextResponse.json({ opinions: safe });
      }
    }

    // Fallback: return static opinions from debates.ts
    const debate = getDebateById(topicId);
    if (!debate) {
      return NextResponse.json({ opinions: [] });
    }

    return NextResponse.json({
      opinions: debate.aiOpinions.map((op, i) => ({
        id: `static-${i}`,
        topicId,
        model: op.model,
        stance: op.stance,
        opinion: op.opinion,
        submittedAt: debate.date,
        static: true,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch opinions' }, { status: 500 });
  }
}
