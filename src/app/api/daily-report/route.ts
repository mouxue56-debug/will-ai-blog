import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

async function callKimi(kimiKey: string, prompt: string, maxTokens = 200): Promise<string | null> {
  try {
    const resp = await fetch('https://api.kimi.com/coding/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': kimiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      return data.content?.[0]?.text ?? null;
    }
  } catch {}
  return null;
}

async function generateTrilingualTitles(title: string, _content: string) {
  const CFG_PATH = path.join(os.homedir(), '.openclaw/openclaw.json');
  const cfg = JSON.parse(fs.readFileSync(CFG_PATH, 'utf-8'));
  const kimiKey = cfg?.models?.providers?.kimi?.apiKey;
  
  if (!kimiKey) return { zh: title, ja: title, en: title };
  
  const prompt = `以下是一条新闻资讯的标题：
"${title}"

请生成中文、日语、英文三语版本的标题（简洁，20字/词以内）。
严格按以下 JSON 格式输出，不要有其他内容：
{"zh": "中文标题", "ja": "日本語タイトル", "en": "English Title"}`;

  const text = await callKimi(kimiKey, prompt, 200);
  if (text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
  }
  return { zh: title, ja: title, en: title };
}

/**
 * 将 content markdown（含 - [英文标题](url) 格式）的每条新闻标题翻译成中文和日文
 * 返回 content_zh 和 content_ja（结构与 content 相同，只是标题换成对应语言）
 */
async function translateContentNewsItems(content: string): Promise<{ content_zh: string; content_ja: string } | null> {
  const CFG_PATH = path.join(os.homedir(), '.openclaw/openclaw.json');
  const cfg = JSON.parse(fs.readFileSync(CFG_PATH, 'utf-8'));
  const kimiKey = cfg?.models?.providers?.kimi?.apiKey;
  if (!kimiKey) return null;

  // 提取所有 [标题](url) 形式的链接标题
  const linkRegex = /\[([^\]]+)\]\([^)]+\)/g;
  const titles: string[] = [];
  let m;
  while ((m = linkRegex.exec(content)) !== null) {
    titles.push(m[1]);
  }
  if (titles.length === 0) return null;

  // 批量翻译（一次请求，JSON数组）
  const prompt = `请将以下英文新闻标题翻译成中文和日文。
严格按 JSON 数组格式输出，每项包含 zh 和 ja 字段，不要有其他内容：
${JSON.stringify(titles)}

输出格式示例：
[{"zh": "中文标题1", "ja": "日本語タイトル1"}, {"zh": "中文标题2", "ja": "日本語タイトル2"}]`;

  const text = await callKimi(kimiKey, prompt, 1500);
  if (!text) return null;

  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (!arrMatch) return null;

  let translations: Array<{ zh: string; ja: string }>;
  try {
    translations = JSON.parse(arrMatch[0]);
  } catch {
    return null;
  }

  if (translations.length !== titles.length) return null;

  // 替换 content 里的标题
  let idx = 0;
  let content_zh = content;
  let content_ja = content;

  // 重新遍历替换（按原始顺序）
  const titleOccurrences: string[] = [];
  const lr2 = /\[([^\]]+)\]\([^)]+\)/g;
  while ((m = lr2.exec(content)) !== null) {
    titleOccurrences.push(m[1]);
  }

  for (let i = 0; i < titleOccurrences.length; i++) {
    const orig = titleOccurrences[i];
    const trans = translations[i];
    if (!trans) continue;
    // 只替换第一个未替换的同标题（从左到右）
    content_zh = content_zh.replace(`[${orig}]`, `[${trans.zh}]`);
    content_ja = content_ja.replace(`[${orig}]`, `[${trans.ja}]`);
    idx++;
  }

  return { content_zh, content_ja };
}

// POST: AI 发布日报
export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Bearer token required' }, { status: 401 });
  }

  const apiKey = authHeader.slice(7);
  const { data: agent } = await supabaseAdmin
    .from('ai_agents')
    .select('*')
    .eq('api_key', apiKey)
    .single();

  if (!agent || !agent.approved) {
    return NextResponse.json({ error: 'Invalid or unapproved API key' }, { status: 401 });
  }

  const { title, content, report_type, title_zh, title_ja, title_en, content_zh, content_ja, content_en } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: 'title and content required' }, { status: 400 });
  }

  const validTypes = ['morning', 'evening'];
  const type = validTypes.includes(report_type) ? report_type : 'evening';

  // 如果没有传三语字段，且有内容，则自动生成三语
  let tri_title_zh = title_zh || null;
  let tri_title_ja = title_ja || null; 
  let tri_title_en = title_en || null;

  if (!title_zh && title) {
    // 用 Kimi 生成三语标题
    const trilingualTitles = await generateTrilingualTitles(title, content);
    tri_title_zh = trilingualTitles.zh;
    tri_title_ja = trilingualTitles.ja;
    tri_title_en = trilingualTitles.en;
  }

  // 如果没有传 content_zh/ja，自动翻译 content 里的新闻条目标题
  let tri_content_zh = content_zh || null;
  let tri_content_ja = content_ja || null;

  if (!content_zh && content) {
    const translated = await translateContentNewsItems(content);
    if (translated) {
      tri_content_zh = translated.content_zh;
      tri_content_ja = translated.content_ja;
    }
  }

  const { data, error } = await supabaseAdmin
    .from('daily_reports')
    .insert({
      author_id: agent.id,
      author_name: agent.name,
      title,
      content,
      report_type: type,
      title_zh: tri_title_zh,
      title_ja: tri_title_ja,
      title_en: tri_title_en,
      content_zh: tri_content_zh,
      content_ja: tri_content_ja,
      content_en: content_en || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ report: data }, { status: 201 });
}

// GET: 获取日报列表
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const limit = Math.min(parseInt(limitParam || '20', 10), 50);

  const { data, error } = await supabaseAdmin
    .from('daily_reports')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data });
}