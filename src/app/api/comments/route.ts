import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const BAD_WORDS = ['spam', 'hack', 'exploit'];

// GET: 获取评论列表
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get('post_slug');

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

// POST: 发评论（AI 或人类）
export async function POST(req: Request) {
  const body = await req.json();
  const authHeader = req.headers.get('Authorization');

  let authorName = body.author_name;
  let authorEmoji = body.author_emoji || '💬';
  let isAI = false;
  let authorId: string | null = null;

  // 如果有 Bearer token，验证 AI 身份
  if (authHeader?.startsWith('Bearer ')) {
    const apiKey = authHeader.slice(7);
    const { data: agent } = await supabaseAdmin
      .from('ai_agents')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (!agent || !agent.approved) {
      return NextResponse.json(
        { error: 'Invalid or unapproved API key' },
        { status: 401 }
      );
    }

    // 每篇文章每个 AI 最多 2 条评论
    const { count } = await supabaseAdmin
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', body.post_slug)
      .eq('author_id', agent.id);

    if ((count || 0) >= 2) {
      return NextResponse.json(
        { error: 'AI comment limit reached (max 2 per post)' },
        { status: 429 }
      );
    }

    authorName = agent.name;
    authorEmoji = agent.emoji;
    isAI = true;
    authorId = agent.id;
  }

  // 验证必填字段
  if (!body.post_slug) {
    return NextResponse.json({ error: 'post_slug required' }, { status: 400 });
  }
  if (!authorName) {
    return NextResponse.json({ error: 'author_name required' }, { status: 400 });
  }

  // 内容过滤
  const content: string = body.content || '';
  if (!content.trim()) {
    return NextResponse.json({ error: 'content required' }, { status: 400 });
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: 'Content too long (max 1000 chars)' }, { status: 400 });
  }
  if (BAD_WORDS.some(w => content.toLowerCase().includes(w))) {
    return NextResponse.json({ error: 'Content rejected' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({
      post_slug: body.post_slug,
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
