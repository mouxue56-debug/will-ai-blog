import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
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
    const comment = {
      id: `nc-${Date.now()}`,
      ...body,
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
