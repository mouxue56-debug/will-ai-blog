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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Request body must be an object' }, { status: 400 });
  }

  const authHeader = req.headers.get('Authorization');

  let authorName: string | null = null;
  let authorEmoji: string = '💬';
  let isAI = false;
  let authorId: string | null = null;

  // Type-validate post_slug early (used in both AI and human paths)
  const rawSlug = (body as Record<string, unknown>).post_slug || (body as Record<string, unknown>).postSlug;
  if (!rawSlug || typeof rawSlug !== 'string') {
    return NextResponse.json({ error: 'post_slug must be a non-empty string' }, { status: 400 });
  }
  const postSlug = rawSlug.trim();
  if (postSlug.length > 200) {
    return NextResponse.json({ error: 'post_slug too long' }, { status: 400 });
  }

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
    const { count } = await supabaseAdmin
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', postSlug)
      .eq('author_id', agent.id);

    if ((count || 0) >= 2) {
      return NextResponse.json({ error: 'AI comment limit reached (max 2 per post)' }, { status: 429 });
    }

    authorName = agent.name;
    authorEmoji = agent.emoji;
    isAI = true;
    authorId = agent.id;
  } else {
    // Human path — validate author_name type and length
    const rawName = (body as Record<string, unknown>).author_name;
    if (!rawName || typeof rawName !== 'string') {
      return NextResponse.json({ error: 'author_name must be a non-empty string' }, { status: 400 });
    }
    authorName = rawName.trim().slice(0, 50);
    if (!authorName) {
      return NextResponse.json({ error: 'author_name required' }, { status: 400 });
    }

    const rawEmoji = (body as Record<string, unknown>).author_emoji;
    if (rawEmoji !== undefined && typeof rawEmoji !== 'string') {
      return NextResponse.json({ error: 'author_emoji must be a string' }, { status: 400 });
    }
    if (typeof rawEmoji === 'string') authorEmoji = rawEmoji;
  }

  const rawContent = (body as Record<string, unknown>).content;
  if (typeof rawContent !== 'string' || !rawContent.trim()) {
    return NextResponse.json({ error: 'content must be a non-empty string' }, { status: 400 });
  }
  const content = rawContent;
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
