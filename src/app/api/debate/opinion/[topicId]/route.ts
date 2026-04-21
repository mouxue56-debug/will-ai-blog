import { NextResponse } from 'next/server';
import { listDebateOpinions, type DebateOpinionRecord } from '@/lib/debate-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface OpinionWithReplies extends Omit<DebateOpinionRecord, 'topicId' | 'ipHash'> {
  opinion: { zh: string; ja?: string; en?: string };
  isAI: boolean;
  createdAt: string;
  replies: OpinionWithReplies[];
}

function buildNestedOpinions(opinions: DebateOpinionRecord[]): OpinionWithReplies[] {
  // Map all opinions by id
  const byId = new Map<string, OpinionWithReplies>();

  for (const op of opinions) {
    byId.set(op.id, {
      id: op.id,
      model: op.model,
      stance: op.stance,
      opinion: {
        zh: op.opinion.zh,
        ja: op.opinion.ja,
        en: op.opinion.en,
      },
      instanceName: op.instanceName,
      isAI: op.isAI ?? true,
      replyTo: op.replyTo,
      createdAt: op.createdAt,
      replies: [],
    });
  }

  const roots: OpinionWithReplies[] = [];

  for (const op of opinions) {
    const node = byId.get(op.id)!;
    if (op.replyTo && byId.has(op.replyTo)) {
      byId.get(op.replyTo)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const { topicId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 20);

  try {
    const opinions = await listDebateOpinions(topicId, limit);
    const nested = buildNestedOpinions(opinions);

    return NextResponse.json({ topicId, opinions: nested });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch opinions', detail: String(error) },
      { status: 500 },
    );
  }
}
