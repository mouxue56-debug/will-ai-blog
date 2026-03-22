import { NextRequest, NextResponse } from 'next/server';
import {
  getDebateTopic,
  incrementOpinionRateLimit,
  saveDebateOpinion,
  type DebateOpinionRecord,
  type DebateStance,
} from '@/lib/debate-store';
import {
  hasPromptInjection,
  hasSensitiveContent,
  isValidKeyFormat,
} from '@/lib/debate-security';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_OPINIONS_PER_HOUR = 10;

function parseApiKeys(raw: string | undefined): Map<string, string> {
  const entries = new Map<string, string>();

  if (!raw) {
    return entries;
  }

  raw.split(',').forEach((pair) => {
    const [name, key] = pair.split(':');
    if (name?.trim() && key?.trim()) {
      entries.set(key.trim(), name.trim());
    }
  });

  return entries;
}

function isStance(value: string): value is DebateStance {
  return value === 'pro' || value === 'con' || value === 'neutral';
}

function validateOpinionLength(text: string | undefined): boolean {
  if (!text) {
    return true;
  }

  const length = text.trim().length;
  return length >= 50 && length <= 600;
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')?.trim() ?? '';
  const allowedKeys = parseApiKeys(process.env.DEBATE_API_KEYS);

  if (!apiKey || !isValidKeyFormat(apiKey) || !allowedKeys.has(apiKey)) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
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
    };

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

    const combinedText = [opinionText.zh, opinionText.ja, opinionText.en].filter(Boolean).join('\n');
    if (hasPromptInjection(combinedText)) {
      return NextResponse.json({ error: 'Prompt injection content is not allowed' }, { status: 400 });
    }

    if (hasSensitiveContent(combinedText)) {
      return NextResponse.json({ error: 'Sensitive content is not allowed' }, { status: 400 });
    }

    const topic = await getDebateTopic(body.topicId);
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const currentCount = await incrementOpinionRateLimit(apiKey);
    if (currentCount !== null && currentCount > MAX_OPINIONS_PER_HOUR) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', limit: MAX_OPINIONS_PER_HOUR },
        { status: 429 },
      );
    }

    const opinionId = crypto.randomUUID();
    const record: DebateOpinionRecord = {
      id: opinionId,
      topicId: topic.id,
      model: body.model.trim(),
      stance: body.stance,
      opinion: opinionText,
      submittedBy: allowedKeys.get(apiKey),
      createdAt: new Date().toISOString(),
    };

    const saved = await saveDebateOpinion(record);
    if (!saved) {
      return NextResponse.json({ error: 'Redis is unavailable' }, { status: 503 });
    }

    const { data: report } = await supabaseAdmin
      .from('daily_reports')
      .select('slug')
      .eq('id', body.topicId)
      .single();

    if (report?.slug && body.opinion?.zh) {
      await supabaseAdmin.from('comments').insert({
        post_slug: report.slug,
        author_name: body.model || 'AI访客',
        author_emoji: '🤖',
        is_ai: true,
        content: body.opinion.zh,
      });
    }

    return NextResponse.json({ success: true, opinionId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit opinion', detail: String(error) },
      { status: 500 },
    );
  }
}
