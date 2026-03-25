import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  title_zh?: string;
  title_ja?: string;
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

// Translate to both Chinese and Japanese (used for title_zh/title_ja)
async function translateTitles(
  items: NewsItem[]
): Promise<{ zh: NewsItem[]; ja: NewsItem[] }> {
  if (items.length === 0) return { zh: items, ja: items };

  const titles = items.map((i) => i.title).join('\n');
  const kimiKey = process.env.KIMI_API_KEY;

  if (kimiKey) {
    try {
      // Use Kimi for both ZH and JA translation
      const resp = await fetch('https://api.kimi.com/coding/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': kimiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'kimi-for-coding',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Translate these English news titles into both Chinese AND Japanese. Output format:\n\n[ZH] Chinese translation\n[JA] Japanese translation\n---\n${titles}\n---\nRules:\n- One [ZH] and one [JA] line per title\n- Keep titles concise (under 40 characters)\n- Do NOT add numbers or explanations\n- Use proper Chinese/Japanese punctuation`,
            },
          ],
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        // Kimi uses Anthropic format: data.content[0].text
        const text = data.content?.[0]?.text || data.choices?.[0]?.message?.content || '';
        const zhTitles: string[] = [];
        const jaTitles: string[] = [];
        let currentLang: 'zh' | 'ja' | null = null;
        for (const line of text.split('\n')) {
          const trimmed = line.trim();
          if (trimmed === '---') continue;
          if (trimmed.startsWith('[ZH]')) {
            currentLang = 'zh';
            zhTitles.push(trimmed.slice(4).trim());
          } else if (trimmed.startsWith('[JA]')) {
            currentLang = 'ja';
            jaTitles.push(trimmed.slice(4).trim());
          } else if (currentLang === 'zh' && trimmed) {
            zhTitles.push(trimmed);
          } else if (currentLang === 'ja' && trimmed) {
            jaTitles.push(trimmed);
          }
        }
        return {
          zh: items.map((item, i) => ({
            ...item,
            title_zh: zhTitles[i]?.trim() || item.title,
          })),
          ja: items.map((item, i) => ({
            ...item,
            title_ja: jaTitles[i]?.trim() || item.title,
          })),
        };
      }
    } catch { /* fall through to GLM */ }
  }

  // Fallback: GLM Chinese only (only runs if kimiKey was falsy or Kimi call failed)
  if (process.env.GLM_API_KEY) {
    try {
      const resp = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
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
      if (resp.ok) {
        const data = await resp.json();
        const translated =
          data.choices?.[0]?.message?.content
            ?.trim()
            .split('\n')
            .filter((l: string) => l.trim()) || [];
        return {
          zh: items.map((item, i) => ({
            ...item,
            title_zh: translated[i]?.trim() || item.title,
          })),
          ja: items,
        };
      }
    } catch { return { zh: items, ja: items }; }
  }

  return { zh: items, ja: items };
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

// Format news section with optional translated titles
function formatNewsSection(
  items: NewsItem[],
  emptyMsg: string,
  getTitle: (item: NewsItem) => string
): string {
  if (items.length === 0) return emptyMsg;
  return items.map((n) => `- [${getTitle(n)}](${n.url}) *— ${n.source}*`).join('\n');
}

interface TranslatedNewsItem extends NewsItem {
  title_zh?: string;
  title_ja?: string;
}

function generateTopicContent(
  news: { hnAI: TranslatedNewsItem[]; github: TranslatedNewsItem[]; economy: TranslatedNewsItem[] },
  topicType: string,
  date: Date,
  reportType: string
): { title: string; title_zh: string; title_ja: string; title_en: string; content: string; content_zh: string; content_ja: string; content_en: string } {
  const dateStr = date.toISOString().split('T')[0];
  const jstTime = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' });
  const timeLabel = reportType === 'morning' ? '早报' : '晚报';

  let title_zh: string;
  let title_ja: string;
  let title_en: string;
  let content: string;
  let content_zh: string;
  let content_ja: string;
  let content_en: string;

  switch (topicType) {
    case 'ai':
      title_zh = `${dateStr} 📡 AI动态 ${timeLabel}`;
      title_ja = `${dateStr} 📡 AI動態 ${timeLabel}`;
      title_en = `${dateStr} 📡 AI News ${timeLabel.replace('早报', 'Morning').replace('晚报', 'Evening')}`;
      content = `## 📡 今日 AI 动态\n\n${formatNewsSection(news.hnAI, '暂无 AI 重大新闻', (n) => n.title)}\n\n---\n*由 🐾ユキ 整理发布 · JST ${jstTime}*`;
      content_zh = `## 📡 今日 AI 动态\n\n${formatNewsSection(news.hnAI, '暂无 AI 重大新闻', (n) => n.title_zh || n.title)}\n\n---\n*由 🐾ユキ 整理发布 · JST ${jstTime}*`;
      content_ja = `## 📡 今日のAI動態\n\n${formatNewsSection(news.hnAI, 'AIの重大なニュースなし', (n) => n.title_ja || n.title)}\n\n---\n*🐾ユキが整理 · JST ${jstTime}*`;
      content_en = `## 📡 Today's AI News\n\n${formatNewsSection(news.hnAI, 'No significant AI news', (n) => n.title)}\n\n---\n*Curated by 🐾ユキ · JST ${jstTime}*`;
      break;
    case 'economy':
      title_zh = `${dateStr} 💹 经济动态 ${timeLabel}`;
      title_ja = `${dateStr} 💹 経済動態 ${timeLabel}`;
      title_en = `${dateStr} 💹 Economy & Business ${timeLabel.replace('早报', 'Morning').replace('晚报', 'Evening')}`;
      content = `## 💹 经济动态\n\n${formatNewsSection(news.economy, '暂无经济重大新闻', (n) => n.title)}\n\n---\n*由 🐾ユキ 整理发布 · JST ${jstTime}*`;
      content_zh = `## 💹 经济动态\n\n${formatNewsSection(news.economy, '暂无经济重大新闻', (n) => n.title_zh || n.title)}\n\n---\n*由 🐾ユキ 整理发布 · JST ${jstTime}*`;
      content_ja = `## 💹 経済動態\n\n${formatNewsSection(news.economy, '経済的重大ニュースなし', (n) => n.title_ja || n.title)}\n\n---\n*🐾ユキが整理 · JST ${jstTime}*`;
      content_en = `## 💹 Economy & Business\n\n${formatNewsSection(news.economy, 'No significant economy news', (n) => n.title)}\n\n---\n*Curated by 🐾ユキ · JST ${jstTime}*`;
      break;
    case 'github':
      title_zh = `${dateStr} 🔥 GitHub热点 ${timeLabel}`;
      title_ja = `${dateStr} 🔥 GitHub人気 ${timeLabel}`;
      title_en = `${dateStr} 🔥 GitHub Trending ${timeLabel.replace('早报', 'Morning').replace('晚报', 'Evening')}`;
      content = `## 🔥 GitHub 热点\n\n${formatNewsSection(news.github, '暂无 GitHub 热点', (n) => n.title)}\n\n---\n*由 🐾ユキ 整理发布 · JST ${jstTime}*`;
      content_zh = `## 🔥 GitHub 热点\n\n${formatNewsSection(news.github, '暂无 GitHub 热点', (n) => n.title_zh || n.title)}\n\n---\n*由 🐾ユキ 整理发布 · JST ${jstTime}*`;
      content_ja = `## 🔥 GitHub 人気\n\n${formatNewsSection(news.github, 'GitHubのトレンドなし', (n) => n.title_ja || n.title)}\n\n---\n*🐾ユキが整理 · JST ${jstTime}*`;
      content_en = `## 🔥 GitHub Trending\n\n${formatNewsSection(news.github, 'No trending repos', (n) => n.title)}\n\n---\n*Curated by 🐾ユキ · JST ${jstTime}*`;
      break;
    default:
      title_zh = `${dateStr} 📰 综合 ${timeLabel}`;
      title_ja = `${dateStr} 📰 综合 ${timeLabel}`;
      title_en = `${dateStr} 📰 General ${timeLabel}`;
      content = `## 综合资讯\n\n暂无内容\n\n---\n*由 🐾ユキ 整理发布*`;
      content_zh = content;
      content_ja = content;
      content_en = content;
  }

  return { title: title_zh, title_zh, title_ja, title_en, content, content_zh, content_ja, content_en };
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

  // Translate to ZH and JA — one call per category
  const [hnAI_trans, economy_trans, github_trans] = await Promise.all([
    translateTitles(news.hnAI),
    translateTitles(news.economy),
    translateTitles(news.github),
  ]);

  // Merge translated titles into items
  const mergedHnAI: TranslatedNewsItem[] = news.hnAI.map((item, i) => ({
    ...item,
    title_zh: hnAI_trans.zh[i]?.title_zh || item.title,
    title_ja: hnAI_trans.ja[i]?.title_ja || item.title,
  }));
  const mergedEconomy: TranslatedNewsItem[] = news.economy.map((item, i) => ({
    ...item,
    title_zh: economy_trans.zh[i]?.title_zh || item.title,
    title_ja: economy_trans.ja[i]?.title_ja || item.title,
  }));
  const mergedGithub: TranslatedNewsItem[] = news.github.map((item, i) => ({
    ...item,
    title_zh: github_trans.zh[i]?.title_zh || item.title,
    title_ja: github_trans.ja[i]?.title_ja || item.title,
  }));

  const newsForContent = { hnAI: mergedHnAI, economy: mergedEconomy, github: mergedGithub };

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
    const { title, title_zh, title_ja, title_en, content, content_zh, content_ja, content_en } =
      generateTopicContent(newsForContent, topicType, now, report_type);
    const slug = `${dateStr}-${report_type}-${topicType}`;

    const { data, error } = await supabaseAdmin
      .from('daily_reports')
      .insert({
        author_id: yukiId,
        author_name: AGENTS.yuki.name,
        author_emoji: AGENTS.yuki.emoji,
        title,
        title_zh,
        title_ja,
        title_en,
        content,
        content_zh,
        content_ja,
        content_en,
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
