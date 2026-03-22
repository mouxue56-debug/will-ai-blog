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

      // Extract news items from markdown content
      function extractNewsItems(content: string): Array<{title: string; url: string; source: string}> {
        const regex = /- \[([^\]]+)\]\(([^)]+)\)\s*\*?—?\s*([^*\n]*)\*?/g;
        const items: Array<{title: string; url: string; source: string}> = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
          items.push({
            title: match[1].trim(),
            url: match[2].trim(),
            source: (match[3] || '').trim().replace(/\*$/, '').trim(),
          });
        }
        return items;
      }

      // Load pre-translated news items
      let translationsMap: Record<string, Array<{title_en: string; title_zh: string; title_ja: string; url: string; source: string}>> = {};
      try {
        translationsMap = (await import('@/data/news-translations.json')).default;
      } catch { /* no translations file */ }

      const mappedTopics = (reports ?? []).map((r) => {
        const rawItems = extractNewsItems(r.content || '');
        // Use translations if available, otherwise use raw items
        const translated = translationsMap[r.id];
        const newsItems = translated
          ? translated.map((t) => ({
              title_en: t.title_en,
              title_zh: t.title_zh,
              title_ja: t.title_ja,
              url: t.url,
              source: t.source,
            }))
          : rawItems.map((item) => ({
              title_en: item.title,
              title_zh: item.title,
              title_ja: item.title,
              url: item.url,
              source: item.source,
            }));

        return {
          id: r.id,
          date: r.published_at?.slice(0, 10) || today,
          session: 'evening' as const,
          title: {
            zh: r.title,
            ja: r.title,
            en: r.title,
          },
          content: r.content,
          newsItems, // Pre-parsed + translated news items
          newsSource: 'https://aiblog.fuluckai.com/debate',
          tags: [r.topic_type || 'ai'],
          slug: r.slug,
        };
      });

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
