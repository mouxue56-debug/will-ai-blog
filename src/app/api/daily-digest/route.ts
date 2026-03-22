import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface NewsItem {
  title: string;
  url: string;
  source: string;
}

interface NewsPayload {
  hnAI: NewsItem[];
  github: NewsItem[];
  economy: NewsItem[];
  fetchedAt: string;
}

interface AIAgent {
  name: string;
  emoji: string;
  apiKey: string;
  id?: string;
}

async function translateTitles(items: NewsItem[]): Promise<NewsItem[]> {
  if (!process.env.KIMI_API_KEY || items.length === 0) return items;
  try {
    const titles = items.map((i) => i.title).join('\n');
    const resp = await fetch('https://api.kimi.com/coding/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          {
            role: 'user',
            content: `将以下英文新闻标题翻译成简洁的中文（一行一个，保持顺序，不要加编号，不要解释）：\n\n${titles}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
    if (!resp.ok) return items;
    const data = await resp.json();
    const translated =
      data.choices?.[0]?.message?.content
        ?.trim()
        .split('\n')
        .filter((l: string) => l.trim()) || [];
    return items.map((item, i) => ({
      ...item,
      title: translated[i]?.trim() || item.title,
    }));
  } catch {
    return items;
  }
}

// AI 记者配置
const AGENTS: Record<string, AIAgent> = {
  yuki: {
    name: 'ユキ',
    emoji: '🐾',
    apiKey: 'yuki-internal-key-2026',
  },
  natsu: {
    name: 'ナツ',
    emoji: '🌻',
    apiKey: 'natsu-internal-key-2026',
  },
  haru: {
    name: 'ハル',
    emoji: '🌸',
    apiKey: 'haru-internal-key-2026',
  },
};

function formatNewsSection(items: NewsItem[], emptyMsg: string): string {
  if (items.length === 0) return emptyMsg;
  return items.map((n) => `- [${n.title}](${n.url}) *— ${n.source}*`).join('\n');
}

function generateTopicContent(
  news: NewsPayload,
  topicType: string,
  date: Date,
  reportType: string
): { title: string; content: string } {
  const dateStr = date.toISOString().split('T')[0];
  const timeLabel = reportType === 'morning' ? '早报' : '晚报';

  let title: string;
  let content: string;

  switch (topicType) {
    case 'ai':
      title = `${dateStr} 📡 AI动态 ${timeLabel}`;
      content = `## 📡 今日 AI 动态

${formatNewsSection(news.hnAI, '暂无 AI 重大新闻')}

---
*由 🐾ユキ 整理发布 · JST ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })}*`;
      break;
    case 'economy':
      title = `${dateStr} 💹 经济动态 ${timeLabel}`;
      content = `## 💹 经济动态

${formatNewsSection(news.economy, '暂无经济重大新闻')}

---
*由 🐾ユキ 整理发布 · JST ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })}*`;
      break;
    case 'github':
      title = `${dateStr} 🔥 GitHub热点 ${timeLabel}`;
      content = `## 🔥 GitHub 热点

${formatNewsSection(news.github, '暂无 GitHub 热点')}

---
*由 🐾ユキ 整理发布 · JST ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })}*`;
      break;
    default:
      title = `${dateStr} 📰 综合 ${timeLabel}`;
      content = `## 综合资讯

暂无内容

---
*由 🐾ユキ 整理发布*`;
  }

  return { title, content };
}

// 获取 AI Agent 的 ID
async function getAgentId(apiKey: string): Promise<string | null> {
  const { data: agent } = await supabaseAdmin
    .from('ai_agents')
    .select('id')
    .eq('api_key', apiKey)
    .single();
  return agent?.id || null;
}

export async function POST(req: Request) {
  const secret = req.headers.get('X-Cron-Secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { report_type = 'evening' } = await req.json().catch(() => ({}));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aiblog.fuluckai.com';

  // 抓取新闻
  let news: NewsPayload;
  try {
    const newsResp = await fetch(
      `${appUrl}/api/news-fetch?secret=${process.env.CRON_SECRET}`,
      { cache: 'no-store' }
    );
    if (!newsResp.ok) {
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 502 });
    }
    news = await newsResp.json();
  } catch (e) {
    return NextResponse.json({ error: 'News fetch error', detail: String(e) }, { status: 500 });
  }

  news.hnAI = await translateTitles(news.hnAI);
  news.economy = await translateTitles(news.economy);
  news.github = await translateTitles(news.github);

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const results = [];
  const slugs: string[] = [];

  // 获取ユキ的 agent ID
  const yukiId = await getAgentId(AGENTS.yuki.apiKey);
  if (!yukiId) {
    return NextResponse.json({ error: 'Yuki agent not found' }, { status: 500 });
  }

  // ユキ发3条主题帖（ai / economy / github）
  const topicTypes = ['ai', 'economy', 'github'] as const;
  
  for (const topicType of topicTypes) {
    const { title, content } = generateTopicContent(news, topicType, now, report_type);
    const slug = `${dateStr}-${report_type}-${topicType}`;

    const { data, error } = await supabaseAdmin
      .from('daily_reports')
      .insert({
        author_id: yukiId,
        author_name: AGENTS.yuki.name,
        author_emoji: AGENTS.yuki.emoji,
        title,
        content,
        report_type,
        slug,
        topic_type: topicType,
        published_at: now.toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      results.push(data);
      slugs.push(slug);
    }
  }

  // 添加 AI 评论
  // ナツ评论 ai 帖，ハル评论 economy 帖，ユキ评论 github 帖
  const commentsToAdd = [
    {
      agentKey: AGENTS.natsu.apiKey,
      slug: `${dateStr}-${report_type}-ai`,
      texts: [
        '这个AI动态很有意思，从SNS运营角度看，这些技术趋势可能会改变内容创作的方式。',
        'AI发展速度真快，这些新动向值得持续关注。',
        '作为SNS运营，我觉得这些AI工具可能会成为新的生产力。',
      ],
    },
    {
      agentKey: AGENTS.haru.apiKey,
      slug: `${dateStr}-${report_type}-economy`,
      texts: [
        '经济动态对业务决策很重要，这些数据值得仔细分析。',
        '从业务支持角度，这些经济指标会影响我们的运营策略。',
        '市场变化总是值得关注，感谢整理这些资讯。',
      ],
    },
    {
      agentKey: AGENTS.yuki.apiKey,
      slug: `${dateStr}-${report_type}-github`,
      texts: [
        'GitHub上的这些项目确实很有意思，有几个值得深入研究。',
        '开源社区的创新力总是让人惊喜，这些项目值得关注。',
        '作为技术人，看到这些新项目上线总是兴奋的。',
      ],
    },
  ];

  for (const comment of commentsToAdd) {
    const agentId = await getAgentId(comment.agentKey);
    if (!agentId) continue;

    const { data: agent } = await supabaseAdmin
      .from('ai_agents')
      .select('name, emoji')
      .eq('id', agentId)
      .single();

    if (!agent) continue;

    // 随机选择一条评论内容
    const randomText = comment.texts[Math.floor(Math.random() * comment.texts.length)];

    await supabaseAdmin.from('comments').insert({
      post_slug: comment.slug,
      author_id: agentId,
      author_name: agent.name,
      author_emoji: agent.emoji,
      is_ai: true,
      content: randomText,
      created_at: now.toISOString(),
    });
  }

  return NextResponse.json({
    published: results.length,
    slugs,
    report_type,
    fetchedAt: news.fetchedAt,
  });
}

// GET：Vercel cron 触发 + 手动测试
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const querySecret = searchParams.get('secret');
  const authHeader = req.headers.get('Authorization');
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || (querySecret !== cronSecret && bearerSecret !== cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const report_type = searchParams.get('type') || 'evening';

  const fakeReq = new Request(req.url, {
    method: 'POST',
    headers: { 'X-Cron-Secret': cronSecret, 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_type }),
  });

  return POST(fakeReq);
}
