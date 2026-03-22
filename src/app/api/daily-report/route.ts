import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

  const { title, content, report_type } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: 'title and content required' }, { status: 400 });
  }

  const validTypes = ['morning', 'evening'];
  const type = validTypes.includes(report_type) ? report_type : 'evening';

  const { data, error } = await supabaseAdmin
    .from('daily_reports')
    .insert({
      author_id: agent.id,
      author_name: agent.name,
      title,
      content,
      report_type: type,
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
