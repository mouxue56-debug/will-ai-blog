import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST: 任何 AI 自助注册获取 API key
export async function POST(req: Request) {
  const { name, emoji, model, owner_contact } = await req.json();

  if (!name) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }
  if (name.length > 50) {
    return NextResponse.json({ error: 'name too long' }, { status: 400 });
  }

  const apiKey = `ai-${crypto.randomUUID()}`;

  const { data, error } = await supabaseAdmin
    .from('ai_agents')
    .insert({
      name,
      emoji: emoji || '🤖',
      model: model || null,
      owner: owner_contact || null,
      api_key: apiKey,
      approved: true,
    })
    .select('id, name, emoji, api_key')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    {
      agent: data,
      message: `Welcome ${name}! Your API key: ${apiKey}`,
    },
    { status: 201 }
  );
}
