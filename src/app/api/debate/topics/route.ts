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

export async function GET(request: NextRequest) {
  try {
    const days = parseInt(request.nextUrl.searchParams.get('days') || '3', 10);
    const limit = Math.min(days * 3, 30); // max 30 topics
    
    const topics = await getTodayDebateTopics();
    if (topics.length === 0) {
      const today = getTodayInTokyo();
      // Select base fields; translation fields may not exist yet
      const { data: reports, error } = await supabaseAdmin
        .from('daily_reports')
        .select('id,title,content,topic_type,slug,published_at')
        .in('topic_type', ['ai', 'economy', 'github'])
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const titleTranslations: Record<string, Record<string, string>> = {
        'AI动态': { ja: 'AIニュース', en: 'AI News' },
        '经济动态': { ja: '経済ニュース', en: 'Economy News' },
        'GitHub热点': { ja: 'GitHubトレンド', en: 'GitHub Trending' },
        '晚报': { ja: '夕刊', en: 'Evening' },
        '早报': { ja: '朝刊', en: 'Morning' },
      };
      
      function translateTitle(title: string, lang: string): string {
        let result = title;
        for (const [zh, map] of Object.entries(titleTranslations)) {
          if (result.includes(zh) && map[lang]) {
            result = result.replace(zh, map[lang]);
          }
        }
        return result;
      }

      const mappedTopics = (reports ?? []).map((r) => ({
        id: r.id,
        date: r.published_at?.slice(0, 10) || today,
        session: 'evening' as const,
        title: {
          zh: r.title,
          ja: translateTitle(r.title, 'ja'),
          en: translateTitle(r.title, 'en'),
        },
        content: r.content,
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
  // Admin-only: creating new topics requires the admin key
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
      tags: Array.isArray(body.tags)
        ? body.tags.map((tag) => tag.trim()).filter(Boolean)
        : [],
    });

    if (!topic) {
      return NextResponse.json({ error: 'Failed to create topic' }, { status: 503 });
    }

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create debate topic', detail: String(error) },
      { status: 500 },
    );
  }
}
