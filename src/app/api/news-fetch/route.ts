import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface NewsItem {
  title: string;
  url: string;
  source: string;
}

// 抓取 Hacker News AI 相关 top stories
async function fetchHNAI(): Promise<NewsItem[]> {
  try {
    const resp = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      next: { revalidate: 0 },
    });
    const ids: number[] = await resp.json();
    const top30 = ids.slice(0, 30);

    const stories = await Promise.all(
      top30.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          next: { revalidate: 0 },
        }).then((r) => r.json())
      )
    );

    const aiKeywords = [
      'ai', 'llm', 'gpt', 'claude', 'gemini', 'openai', 'anthropic',
      'agent', 'ml', 'machine learning', 'neural', 'deepseek', 'mistral',
      'diffusion', 'transformer', 'chatbot', 'copilot',
    ];

    return stories
      .filter(
        (s) =>
          s &&
          s.title &&
          aiKeywords.some((k) => s.title.toLowerCase().includes(k))
      )
      .slice(0, 5)
      .map((s) => ({
        title: s.title as string,
        url: (s.url as string) || `https://news.ycombinator.com/item?id=${s.id}`,
        source: 'Hacker News',
      }));
  } catch {
    return [];
  }
}

// 抓取 GitHub Trending（非官方 API，fallback 到静态链接）
async function fetchGithubTrending(): Promise<NewsItem[]> {
  try {
    const resp = await fetch(
      'https://api.gitterapp.com/repositories?since=daily&language=',
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 0 },
      }
    );
    if (!resp.ok) throw new Error('gitterapp api failed');
    const repos: Array<{ name: string; description?: string; url: string }> =
      await resp.json();
    return repos.slice(0, 5).map((r) => ({
      title: `${r.name}${r.description ? ` — ${r.description}` : ''}`,
      url: r.url,
      source: 'GitHub Trending',
    }));
  } catch {
    // fallback: 返回 GitHub Trending 页面链接
    return [
      {
        title: 'GitHub Trending — 今日最热仓库',
        url: 'https://github.com/trending',
        source: 'GitHub',
      },
    ];
  }
}

// 抓取经济新闻（Reuters RSS，fallback 到 AP RSS）
async function fetchEconomyNews(): Promise<NewsItem[]> {
  const feeds = [
    {
      url: 'https://feeds.reuters.com/reuters/businessNews',
      source: 'Reuters',
      baseUrl: 'https://www.reuters.com/business/',
    },
    {
      url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
      source: 'BBC Business',
      baseUrl: 'https://www.bbc.com/news/business',
    },
  ];

  for (const feed of feeds) {
    try {
      const resp = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WillAIBot/1.0)' },
        next: { revalidate: 0 },
      });
      if (!resp.ok) continue;
      const xml = await resp.text();

      // 解析 CDATA 标题
      const cdataMatches =
        xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || [];
      // 解析普通标题（BBC 用这种格式）
      const plainMatches =
        xml.match(/<item>[\s\S]*?<title>(.*?)<\/title>/g) || [];

      if (cdataMatches.length > 1) {
        return cdataMatches.slice(1, 6).map((m) => ({
          title: m
            .replace(/<title><!\[CDATA\[/, '')
            .replace(/\]\]><\/title>/, ''),
          url: feed.baseUrl,
          source: feed.source,
        }));
      }

      if (plainMatches.length > 0) {
        return plainMatches.slice(0, 5).map((m) => {
          const titleMatch = m.match(/<title>([\s\S]*?)<\/title>/);
          return {
            title: titleMatch ? titleMatch[1].trim() : 'Business News',
            url: feed.baseUrl,
            source: feed.source,
          };
        });
      }
    } catch {
      continue;
    }
  }

  return [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [hnAI, github, economy] = await Promise.all([
    fetchHNAI(),
    fetchGithubTrending(),
    fetchEconomyNews(),
  ]);

  return NextResponse.json({
    hnAI,
    github,
    economy,
    fetchedAt: new Date().toISOString(),
  });
}
