import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

interface Reporter {
  name: string;
  emoji: string;
  angle: string;
  angleJa: string;
  angleEn: string;
}

// 三位 AI 记者
const REPORTERS: Reporter[] = [
  { name: 'ユキ', emoji: '🐾', angle: '技术视角', angleJa: '技術視点', angleEn: 'Tech Perspective' },
  { name: 'ナツ', emoji: '🌻', angle: 'SNS运营视角', angleJa: 'SNS運営視点', angleEn: 'SNS Operations' },
  { name: 'ハル', emoji: '🌸', angle: 'AI员工视角', angleJa: 'AI社員視点', angleEn: 'AI Employee View' },
];

function formatNewsSection(items: NewsItem[], emptyMsg: string): string {
  if (items.length === 0) return emptyMsg;
  return items.map((n) => `- [${n.title}](${n.url}) *— ${n.source}*`).join('\n');
}

function generateMarkdown(
  news: NewsPayload,
  reporter: Reporter,
  reportType: string,
  date: Date
): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeLabel = reportType === 'morning' ? '早报' : '晚报';
  const timeLabelJa = reportType === 'morning' ? '朝刊' : '夕刊';
  const timeLabelEn = reportType === 'morning' ? 'Morning Brief' : 'Evening Brief';

  const zhTitle = `${dateStr} ${reporter.emoji}${reporter.name}的AI日${timeLabel}（${reporter.angle}）`;
  const jaTitle = `${dateStr} ${reporter.emoji}${reporter.name}のAI日${timeLabelJa}（${reporter.angleJa}）`;
  const enTitle = `${dateStr} ${reporter.emoji}${reporter.name}'s AI ${timeLabelEn} (${reporter.angleEn})`;

  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });

  const content = `## 今日 AI 动态

${formatNewsSection(news.hnAI, '暂无 AI 重大新闻')}

## 经济动态

${formatNewsSection(news.economy, '暂无经济重大新闻')}

## GitHub 热点

${formatNewsSection(news.github, '暂无 GitHub 热点')}

---
*由 ${reporter.emoji}${reporter.name}（${reporter.angle}）整理发布 · JST ${timeStr}*`;

  const sources = [
    ...new Set([
      ...news.hnAI.map((n) => n.source),
      ...news.economy.map((n) => n.source),
      ...news.github.map((n) => n.source),
    ]),
  ].join(', ');

  const tags = [
    'AI',
    'news',
    reportType === 'morning' ? 'morning' : 'evening',
    reporter.name,
  ].join(', ');

  const willCommentZh = `${reporter.emoji}${reporter.name} 从${reporter.angle}整理了今日重要动态，数据来源：${sources}。`;
  const willCommentJa = `${reporter.emoji}${reporter.name} が${reporter.angleJa}で本日の重要ニュースをまとめました。`;
  const willCommentEn = `${reporter.emoji}${reporter.name} curated today's key updates from a ${reporter.angleEn}.`;

  return `---
date: "${dateStr}"
slug: "${dateStr}-${reporter.name}-${reportType}"
title:
  zh: "${zhTitle}"
  ja: "${jaTitle}"
  en: "${enTitle}"
sources: [${sources.split(', ').map(s => `"${s}"`).join(', ')}]
tags: [${tags.split(', ').map(t => `"${t}"`).join(', ')}]
willComment:
  zh: "${willCommentZh}"
  ja: "${willCommentJa}"
  en: "${willCommentEn}"
---
${content}
`;
}

export async function POST(req: Request) {
  // 验证 cron secret
  const secret = req.headers.get('X-Cron-Secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { report_type = 'evening' } = await req.json().catch(() => ({}));

  // 抓取新闻
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aiblog.fuluckai.com';
  let news: NewsPayload;

  try {
    const newsResp = await fetch(
      `${appUrl}/api/news-fetch?secret=${process.env.CRON_SECRET}`,
      { next: { revalidate: 0 } }
    );
    if (!newsResp.ok) {
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 502 });
    }
    news = await newsResp.json();
  } catch (e) {
    return NextResponse.json({ error: 'News fetch error', detail: String(e) }, { status: 500 });
  }

  // 写入 markdown 文件到 src/content/digest/
  const digestDir = path.join(process.cwd(), 'src', 'content', 'digest');
  if (!fs.existsSync(digestDir)) {
    fs.mkdirSync(digestDir, { recursive: true });
  }

  const now = new Date();
  const results: string[] = [];

  for (const reporter of REPORTERS) {
    const slug = `${now.toISOString().split('T')[0]}-${reporter.name}-${report_type}`;
    const filename = `${slug}.md`;
    const filePath = path.join(digestDir, filename);

    const markdown = generateMarkdown(news, reporter, report_type, now);
    fs.writeFileSync(filePath, markdown, 'utf-8');
    results.push(filename);
  }

  return NextResponse.json({
    published: results.length,
    files: results,
    report_type,
    fetchedAt: news.fetchedAt,
  });
}

// GET 端点：手动触发（方便测试）
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const report_type = searchParams.get('type') || 'evening';

  // 复用 POST 逻辑
  const fakeReq = new Request(req.url, {
    method: 'POST',
    headers: { 'X-Cron-Secret': process.env.CRON_SECRET, 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_type }),
  });

  return POST(fakeReq);
}
