import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface NewsItem {
  title: string;
  url: string;
  source: string;
}

const GITHUB_TRENDING_FALLBACK: NewsItem[] = [
  {
    title: 'microsoft/vscode — VS Code 编辑器',
    url: 'https://github.com/microsoft/vscode',
    source: 'GitHub Trending',
  },
  {
    title: 'huggingface/transformers — 最流行AI模型库',
    url: 'https://github.com/huggingface/transformers',
    source: 'GitHub Trending',
  },
  {
    title: 'langchain-ai/langchain — LLM应用开发框架',
    url: 'https://github.com/langchain-ai/langchain',
    source: 'GitHub Trending',
  },
  {
    title: 'open-webui/open-webui — 本地AI聊天界面',
    url: 'https://github.com/open-webui/open-webui',
    source: 'GitHub Trending',
  },
  {
    title: 'ollama/ollama — 本地运行大模型',
    url: 'https://github.com/ollama/ollama',
    source: 'GitHub Trending',
  },
];

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

function normalizeGithubTrendingItems(items: NewsItem[]): NewsItem[] {
  return items
    .filter((item) => item.title && item.url)
    .slice(0, 5)
    .map((item) => ({
      title: item.title.trim(),
      url: item.url.trim(),
      source: 'GitHub Trending',
    }));
}

async function fetchGithubTrendingFromApi(): Promise<NewsItem[]> {
  const resp = await fetch(
    'https://github-trending-api.walinejs.workers.dev/repositories?since=daily',
    {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    }
  );
  if (!resp.ok) throw new Error('waline trending api failed');

  const repos: Array<{
    author?: string;
    name?: string;
    description?: string;
    url?: string;
  }> = await resp.json();

  return normalizeGithubTrendingItems(
    repos.map((repo) => ({
      title:
        repo.author && repo.name
          ? `${repo.author}/${repo.name}${repo.description ? ` — ${repo.description}` : ''}`
          : `${repo.name || 'GitHub Repo'}${repo.description ? ` — ${repo.description}` : ''}`,
      url: repo.url || '',
      source: 'GitHub Trending',
    }))
  );
}

async function fetchGithubTrendingFromHtml(): Promise<NewsItem[]> {
  const resp = await fetch('https://github.com/trending', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WillAIBot/1.0)' },
    next: { revalidate: 0 },
  });
  if (!resp.ok) throw new Error('github trending html failed');

  const html = await resp.text();
  const articleMatches = html.match(/<article class="Box-row[\s\S]*?<\/article>/g) || [];
  const items = articleMatches.map((article) => {
    const repoMatch = article.match(/<h2[^>]*>[\s\S]*?<a[^>]*href="\/([^"]+)"[^>]*>/i);
    const descMatch = article.match(/<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    const repoName = repoMatch?.[1]?.replace(/\s+/g, '');
    const description = descMatch?.[1]
      ?.replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      title: repoName ? `${repoName}${description ? ` — ${description}` : ''}` : '',
      url: repoName ? `https://github.com/${repoName}` : '',
      source: 'GitHub Trending',
    };
  });

  return normalizeGithubTrendingItems(items);
}

// 抓取 GitHub Trending（API -> HTML -> hardcode fallback）
async function fetchGithubTrending(): Promise<NewsItem[]> {
  try {
    const apiItems = await fetchGithubTrendingFromApi();
    if (apiItems.length > 0) return apiItems;
  } catch {
    // Continue to HTML fallback.
  }

  try {
    const htmlItems = await fetchGithubTrendingFromHtml();
    if (htmlItems.length > 0) return htmlItems;
  } catch {
    // Continue to static fallback.
  }

  return GITHUB_TRENDING_FALLBACK;
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
