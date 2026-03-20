import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { newsData } from '@/data/news-data';
import type { NewsCategory } from '@/data/news';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as NewsCategory | null;
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let filtered = [...newsData];

  if (category && ['ai', 'tech', 'business', 'life', 'cats'].includes(category)) {
    filtered = filtered.filter((n) => n.category === category);
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit);

  return NextResponse.json({
    items,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
  });
}

export async function POST(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    // In a real app, this would save to a database
    // For now, return success with the submitted data
    return NextResponse.json(
      {
        success: true,
        message: 'News item created',
        item: {
          id: `news-${Date.now()}`,
          ...body,
          createdAt: new Date().toISOString(),
          comments: [],
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
