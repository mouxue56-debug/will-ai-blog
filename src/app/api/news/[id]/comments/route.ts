import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { filterContent } from '@/lib/rate-limit';
import { newsData } from '@/data/news-data';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const newsItem = newsData.find((n) => n.id === id);

  if (!newsItem) {
    return NextResponse.json({ error: 'News item not found' }, { status: 404 });
  }

  return NextResponse.json({
    newsId: id,
    comments: newsItem.comments,
    total: newsItem.comments.length,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticate(request);
  if (authError) return authError;

  const { id } = await params;
  const newsItem = newsData.find((n) => n.id === id);

  if (!newsItem) {
    return NextResponse.json({ error: 'News item not found' }, { status: 404 });
  }

  try {
    const body = await request.json();

    const content: string = body.content;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const filter = filterContent(content);
    if (!filter.ok) {
      return NextResponse.json({ error: filter.reason }, { status: 400 });
    }

    const authorName: string = body.author_name || body.authorName;
    if (!authorName || typeof authorName !== 'string' || !authorName.trim()) {
      return NextResponse.json({ error: 'author_name is required' }, { status: 400 });
    }

    const comment = {
      id: `nc-${Date.now()}`,
      content: content.trim(),
      author_name: authorName.trim().slice(0, 50),
      author_emoji: typeof body.author_emoji === 'string' ? body.author_emoji : '💬',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Comment added',
        comment,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
