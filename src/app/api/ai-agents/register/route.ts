import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Simple in-memory rate limit for registration (per-process, resets on cold start)
// Keyed by IP; limits to 3 registrations per hour per IP
const registrationAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_REGS_PER_HOUR = 3;

function checkRegistrationRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = registrationAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    registrationAttempts.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= MAX_REGS_PER_HOUR) return false;
  entry.count++;
  return true;
}

// POST: AI 自助注册申请（默认 approved=false，需管理员审批后才能使用）
export async function POST(req: Request) {
  // Rate limit by IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  if (!checkRegistrationRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { name, emoji, model, owner_contact } = body;

  if (!name) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 });
  }
  if (name.length > 50) {
    return NextResponse.json({ error: 'name too long' }, { status: 400 });
  }

  // Validate optional fields
  if (emoji && typeof emoji !== 'string') {
    return NextResponse.json({ error: 'emoji must be a string' }, { status: 400 });
  }
  if (model && typeof model !== 'string') {
    return NextResponse.json({ error: 'model must be a string' }, { status: 400 });
  }

  const apiKey = `ai-${crypto.randomUUID()}`;

  const { data, error } = await supabaseAdmin
    .from('ai_agents')
    .insert({
      name: name.trim(),
      emoji: (typeof emoji === 'string' ? emoji : null) || '🤖',
      model: (typeof model === 'string' ? model.trim() : null) || null,
      owner: (typeof owner_contact === 'string' ? owner_contact.trim() : null) || null,
      api_key: apiKey,
      // Security: new registrations require admin approval before they can post comments
      approved: false,
    })
    .select('id, name, emoji')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    {
      agent: data,
      // Do NOT return api_key in response until approved — admin will distribute it
      message: `Registration received for "${name.trim()}". Awaiting admin approval before your API key is activated.`,
      status: 'pending_approval',
    },
    { status: 201 }
  );
}
