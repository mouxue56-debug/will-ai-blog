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
    // days param kept for backward compat but no longer enforces a cutoff
    
    // 始终从 daily_reports 读取真实资讯作为讨论话题，不使用凭空生成的 debate_topics
    if (true) {
      const today = getTodayInTokyo();
      // Select base fields; translation fields may not exist yet — no limit, full history
      const { data: reports, error } = await supabaseAdmin
        .from('daily_reports')
        .select('id,title,title_zh,title_ja,title_en,content,content_zh,content_ja,content_en,topic_type,slug,published_at')
        .in('topic_type', ['ai', 'economy', 'github'])
        .order('published_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Extract title from a specific URL within markdown content
      function extractTitleFromContent(content: string, url: string): string {
        const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`- \\[([^\\]]+)\\]\\(${escaped}\\)\\s*\\*?—?\\s*([^\\n]*)\\*?`);
        const match = content.match(regex);
        return match ? match[1].trim() : '';
      }

      // Extract news items from markdown content (returns items with url + source, no title yet)
      function extractNewsItemsRaw(content: string): Array<{url: string; source: string}> {
        const regex = /- \[([^\]]+)\]\(([^)]+)\)\s*\*?—?\s*([^*\n]*)\*?/g;
        const items: Array<{url: string; source: string}> = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
          items.push({
            url: match[2].trim(),
            source: (match[3] || '').trim().replace(/\*$/, '').trim(),
          });
        }
        return items;
      }

      const mappedTopics = (reports ?? []).map((r) => {
        // Extract from all three content versions
        const rawEn = extractNewsItemsRaw(r.content || '');
        const rawZh = extractNewsItemsRaw(r.content_zh || r.content || '');
        const rawJa = extractNewsItemsRaw(r.content_ja || r.content || '');

        // Build translated title arrays by matching URL index
        const maxLen = Math.max(rawEn.length, rawZh.length, rawJa.length);
        const newsItems = Array.from({ length: maxLen }, (_, i) => ({
          title_en: rawEn[i] ? extractTitleFromContent(r.content || '', rawEn[i].url) : '',
          title_zh: rawZh[i] ? extractTitleFromContent(r.content_zh || r.content || '', rawZh[i].url) : (rawEn[i] ? extractTitleFromContent(r.content || '', rawEn[i].url) : ''),
          title_ja: rawJa[i] ? extractTitleFromContent(r.content_ja || r.content || '', rawJa[i].url) : (rawEn[i] ? extractTitleFromContent(r.content || '', rawEn[i].url) : ''),
          url: rawEn[i]?.url || rawZh[i]?.url || '',
          source: rawEn[i]?.source || '',
        }));

        return {
          id: r.id,
          date: r.published_at?.slice(0, 10) || today,
          session: 'evening' as const,
          title: {
            zh: r.title_zh || r.title,
            ja: r.title_ja || r.title,
            en: r.title_en || r.title,
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
