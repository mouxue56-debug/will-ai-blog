import { NextRequest, NextResponse } from 'next/server';
import {
  getTodayDebateTopics,
  getTodayInTokyo,
  saveDebateTopic,
  type DebateSession,
  type DebateTopic,
} from '@/lib/debate-store';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function isDebateSession(value: string): value is DebateSession {
  return value === 'morning' || value === 'evening';
}

export async function GET() {
  try {
    const topics = await getTodayDebateTopics();
    return NextResponse.json({ topics });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch debate topics', detail: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const adminKey = process.env.DEBATE_ADMIN_KEY;
  const requestKey = request.headers.get('x-api-key');

  if (!adminKey) {
    return NextResponse.json({ error: 'Admin key is not configured' }, { status: 503 });
  }

  if (!requestKey || requestKey !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      title?: Record<'zh' | 'ja' | 'en', string>;
      newsSource?: string;
      session?: DebateSession;
      tags?: string[];
    };

    if (
      !body.title?.zh ||
      !body.title.ja ||
      !body.title.en ||
      !body.newsSource ||
      !body.session ||
      !isDebateSession(body.session)
    ) {
      return NextResponse.json({ error: 'Invalid topic payload' }, { status: 400 });
    }

    const date = getTodayInTokyo();
    const topic: DebateTopic = {
      id: `${date}-${body.session}`,
      date,
      session: body.session,
      title: {
        zh: body.title.zh.trim(),
        ja: body.title.ja.trim(),
        en: body.title.en.trim(),
      },
      newsSource: body.newsSource.trim(),
      tags: Array.isArray(body.tags) ? body.tags.map((tag) => tag.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
    };

    const saved = await saveDebateTopic(topic);
    if (!saved) {
      return NextResponse.json({ error: 'Redis is unavailable' }, { status: 503 });
    }

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create debate topic', detail: String(error) },
      { status: 500 },
    );
  }
}
