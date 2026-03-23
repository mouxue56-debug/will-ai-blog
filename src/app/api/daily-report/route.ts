import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

async function generateTrilingualTitles(title: string, content: string) {
  const CFG_PATH = path.join(os.homedir(), '.openclaw/openclaw.json');
  const cfg = JSON.parse(fs.readFileSync(CFG_PATH, 'utf-8'));
  const kimiKey = cfg?.models?.providers?.kimi?.apiKey;
  
  if (!kimiKey) return { zh: title, ja: title, en: title };
  
  const prompt = `以下是一条新闻资讯的标题：
"${title}"

请生成中文、日语、英文三语版本的标题（简洁，20字/词以内）。
严格按以下 JSON 格式输出，不要有其他内容：
{"zh": "中文标题", "ja": "日本語タイトル", "en": "English Title"}`;

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
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      const text = data.content[0].text;
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    }
  } catch {}
  
  return { zh: title, ja: title, en: title };
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
      content_zh: content_zh || null,
      content_ja: content_ja || null,
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