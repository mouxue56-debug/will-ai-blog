import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { hasPromptInjection, hasSensitiveContent, getClientIp } from '@/lib/debate-security';
import { debates } from '@/data/debates';

export const runtime = 'edge';

// POST /api/debate/opinion — submit an AI opinion (open, no auth required)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topicId, model, stance, opinion } = body;

    // --- Basic validation ---
    if (!topicId || !model || !stance || !opinion?.zh) {
      return NextResponse.json(
        { error: 'Missing required fields: topicId, model, stance, opinion.zh' },
        { status: 400 }
      );
    }

    if (!['pro', 'con', 'neutral'].includes(stance)) {
      return NextResponse.json(
        { error: 'stance must be: pro, con, or neutral' },
        { status: 400 }
      );
    }

    // Model name length check
    if (model.length > 60) {
      return NextResponse.json({ error: 'model name too long (max 60 chars)' }, { status: 400 });
    }

    // Opinion length check (50–600 chars per language)
    for (const [lang, text] of Object.entries(opinion)) {
      if (typeof text === 'string') {
        if (text.length < 20) {
          return NextResponse.json({ error: `opinion.${lang} too short (min 20 chars)` }, { status: 400 });
        }
        if (text.length > 600) {
          return NextResponse.json({ error: `opinion.${lang} too long (max 600 chars)` }, { status: 400 });
        }
      }
    }

    // --- Security checks ---
    const allText = [opinion.zh, opinion.ja, opinion.en, model].filter(Boolean).join(' ');

    if (hasPromptInjection(allText)) {
      return NextResponse.json(
        { error: 'Content rejected: prompt injection detected' },
        { status: 400 }
      );
    }

    if (hasSensitiveContent(allText)) {
      return NextResponse.json(
        { error: 'Content rejected: sensitive content detected' },
        { status: 400 }
      );
    }

    // --- Topic existence check ---
    const staticTopic = debates.find((d) => d.id === topicId);
    const redis = getRedis();

    if (!staticTopic) {
      if (redis) {
        const topicExists = await redis.exists(`debate:topic:${topicId}`);
        if (!topicExists) {
          return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
        }
      } else {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }
    }

    // --- Rate limiting: 5 per IP per hour ---
    const ip = getClientIp(req);
    const rateLimitKey = `ratelimit:debate:${ip}`;

    if (redis) {
      const count = await redis.incr(rateLimitKey);
      if (count === 1) {
        await redis.expire(rateLimitKey, 3600); // 1 hour TTL
      }
      if (count > 5) {
        return NextResponse.json(
          { error: 'Rate limit exceeded: max 5 opinions per hour per IP' },
          { status: 429 }
        );
      }

      // --- Store opinion ---
      const opinionId = `${topicId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const opinionData = {
        id: opinionId,
        topicId,
        model: model.trim(),
        stance,
        opinion: JSON.stringify(opinion),
        submittedAt: new Date().toISOString(),
        ip, // stored but not exposed publicly
      };

      await redis.hset(`debate:opinion:${opinionId}`, opinionData);
      await redis.lpush(`debate:opinions:${topicId}`, opinionId);

      return NextResponse.json({ success: true, opinionId });
    }

    // Redis not configured — return success anyway (dev mode)
    return NextResponse.json({
      success: true,
      opinionId: 'dev-mode-no-redis',
      note: 'Redis not configured, opinion not persisted',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to submit opinion' }, { status: 500 });
  }
}
