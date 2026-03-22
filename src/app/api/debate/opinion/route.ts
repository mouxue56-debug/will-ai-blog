import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  checkAndIncrementRateLimit,
  getDebateTopic,
  saveDebateOpinion,
  type DebateOpinionRecord,
  type DebateStance,
} from '@/lib/debate-store';
import {
  hasPromptInjection,
  hasSensitiveContent,
} from '@/lib/debate-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isStance(value: string): value is DebateStance {
  return value === 'pro' || value === 'con' || value === 'neutral';
}

function validateOpinionLength(text: string | undefined): boolean {
  if (!text) {
    return true;
  }
  const length = text.trim().length;
  return length >= 10 && length <= 2000;
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

function extractIP(request: NextRequest): string {
  // Vercel / reverse-proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  // Fallback — unknown but still hash-able
  return 'unknown';
}

export async function POST(request: NextRequest) {
  // ── IP extraction & rate limit ────────────────────────────────────────────
  const clientIP = extractIP(request);
  const ipHash = hashIP(clientIP);

  const { allowed, remaining } = await checkAndIncrementRateLimit(ipHash);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 5 submissions per day per IP.' },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as {
      topicId?: string;
      model?: string;
      stance?: DebateStance;
      opinion?: {
        zh?: string;
        ja?: string;
        en?: string;
      };
      replyTo?: string;
      instanceName?: string;
    };

    // ── Required field validation ─────────────────────────────────────────
    if (!body.topicId || !body.model || !body.stance || !body.opinion?.zh) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isStance(body.stance)) {
      return NextResponse.json({ error: 'Invalid stance' }, { status: 400 });
    }

    const opinionText = {
      zh: body.opinion.zh.trim(),
      ja: body.opinion.ja?.trim(),
      en: body.opinion.en?.trim(),
    };

    if (
      !validateOpinionLength(opinionText.zh) ||
      !validateOpinionLength(opinionText.ja) ||
      !validateOpinionLength(opinionText.en)
    ) {
      return NextResponse.json(
        { error: 'Opinion length must be 50-600 characters per provided language' },
        { status: 400 },
      );
    }

    // ── Security checks ───────────────────────────────────────────────────
    const combinedText = [opinionText.zh, opinionText.ja, opinionText.en]
      .filter(Boolean)
      .join('\n');

    if (hasPromptInjection(combinedText)) {
      return NextResponse.json(
        { error: 'Prompt injection content is not allowed' },
        { status: 400 },
      );
    }

    if (hasSensitiveContent(combinedText)) {
      return NextResponse.json(
        { error: 'Sensitive content is not allowed' },
        { status: 400 },
      );
    }

    // ── Topic lookup ──────────────────────────────────────────────────────
    const topic = await getDebateTopic(body.topicId);
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // ── Persist opinion ───────────────────────────────────────────────────
    const opinionId = crypto.randomUUID();
    const record: DebateOpinionRecord = {
      id: opinionId,
      topicId: topic.id,
      model: body.model.trim(),
      stance: body.stance,
      opinion: opinionText,
      isAI: true,
      replyTo: body.replyTo?.trim() || undefined,
      instanceName: body.instanceName?.trim() || undefined,
      ipHash,
      createdAt: new Date().toISOString(),
    };

    const saved = await saveDebateOpinion(record);
    if (!saved) {
      return NextResponse.json({ error: 'Failed to save opinion' }, { status: 503 });
    }

    return NextResponse.json({ success: true, opinionId, remaining }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit opinion', detail: String(error) },
      { status: 500 },
    );
  }
}
