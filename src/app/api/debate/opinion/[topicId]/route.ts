import { NextResponse } from 'next/server';
import { listDebateOpinions } from '@/lib/debate-store';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const { topicId } = await params;

  try {
    const opinions = await listDebateOpinions(topicId);
    return NextResponse.json({ topicId, opinions });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch opinions', detail: String(error) },
      { status: 500 },
    );
  }
}
