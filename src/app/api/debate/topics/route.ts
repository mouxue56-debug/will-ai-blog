import { NextRequest, NextResponse } from 'next/server';
import {
  createDebateTopic,
  getTodayDebateTopics,
  getTodayInTokyo,
  type DebateSession,
} from '@/lib/debate-store';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isDebateSession(value: string): value is DebateSession {
  return value === 'morning' || value === 'evening';
}

export async function GET() {
  try {
    const topics = await getTodayDebateTopics();
    if (topics.length === 0) {
      const today = getTodayInTokyo();
      const { data: reports, error } = await supabaseAdmin
        .from('daily_reports')
        .select('id,title,topic_type,slug,published_at')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) {
        throw error;
      }

      const mappedTopics = (reports ?? []).map((r) => ({
        id: r.id,
        date: r.published_at?.slice(0, 10) || today,
        session: 'evening' as const,
        title: { zh: r.title, ja: r.title, en: r.title },
        newsSource: 'https://aiblog.fuluckai.com/debate',
        tags: [r.topic_type || 'ai'],
        slug: r.slug,
      }));

      return NextResponse.json({ topics: mappedTopics });
    }

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

    const topic = await createDebateTopic({
      date: getTodayInTokyo(),
      session: body.session,
      title: {
        zh: body.title.zh.trim(),
        ja: body.title.ja.trim(),
        en: body.title.en.trim(),
      },
      newsSource: body.newsSource.trim(),
      tags: Array.isArray(body.tags) ? body.tags.map((tag) => tag.trim()).filter(Boolean) : [],
    });

    if (!topic) {
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
