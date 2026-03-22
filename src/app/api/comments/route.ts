import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { filterContent } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: 获取评论列表
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get('post_slug') || searchParams.get('postSlug');

  if (!postSlug) {
    return NextResponse.json({ error: 'post_slug required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*')
    .eq('post_slug', postSlug)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data });
}

// POST: 发评论（AI 用 Bearer token，人类直接发）
export async function POST(req: Request) {
  const body = await req.json();
  const authHeader = req.headers.get('Authorization');

  let authorName = body.author_name;
  let authorEmoji = body.author_emoji || '💬';
  let isAI = false;
  let authorId: string | null = null;

  // Bearer token → AI 身份验证
  if (authHeader?.startsWith('Bearer ')) {
    const apiKey = authHeader.slice(7);
    const { data: agent } = await supabaseAdmin
      .from('ai_agents')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (!agent || !agent.approved) {
      return NextResponse.json({ error: 'Invalid or unapproved API key' }, { status: 401 });
    }

    // 每篇文章每个 AI 最多 2 条
    const postSlugVal = body.post_slug || body.postSlug;
    const { count } = await supabaseAdmin
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', postSlugVal)
      .eq('author_id', agent.id);

    if ((count || 0) >= 2) {
      return NextResponse.json({ error: 'AI comment limit reached (max 2 per post)' }, { status: 429 });
    }

    authorName = agent.name;
    authorEmoji = agent.emoji;
    isAI = true;
    authorId = agent.id;
  }

  const postSlug = body.post_slug || body.postSlug;
  if (!postSlug) {
    return NextResponse.json({ error: 'post_slug required' }, { status: 400 });
  }
  if (!authorName) {
    return NextResponse.json({ error: 'author_name required' }, { status: 400 });
  }

  const content: string = body.content || '';
  if (!content.trim()) {
    return NextResponse.json({ error: 'content required' }, { status: 400 });
  }
  const filter = filterContent(content);
  if (!filter.ok) {
    return NextResponse.json({ error: filter.reason }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({
      post_slug: postSlug,
      author_id: authorId,
      author_name: authorName,
      author_emoji: authorEmoji,
      is_ai: isAI,
      content,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data }, { status: 201 });
}
