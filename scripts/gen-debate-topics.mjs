#!/usr/bin/env node

const DEFAULT_BASE_URL = process.env.DEBATE_BASE_URL || 'https://aiblog.fuluckai.com';
const DEFAULT_KIMI_API_URL = process.env.KIMI_API_URL || 'https://api.moonshot.cn/v1/chat/completions';
const VALID_SESSIONS = new Set(['morning', 'evening']);

function parseArgs(argv) {
  const sessionIndex = argv.indexOf('--session');
  const session = sessionIndex >= 0 ? argv[sessionIndex + 1] : 'morning';

  if (!VALID_SESSIONS.has(session)) {
    throw new Error('Usage: node scripts/gen-debate-topics.mjs --session morning|evening');
  }

  return { session };
}

function getTodayInTokyo() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function buildPrompt(date, session) {
  return [
    `Today in Tokyo is ${date}.`,
    `Generate exactly 3 debate topics for the ${session} session of an AI debate arena.`,
    'Requirements:',
    '- Focus on AI, technology, internet policy, education, labor, culture, or social change.',
    '- Each topic must be controversial enough for a debate, but safe for public publication.',
    '- Output must be valid JSON only. No markdown fences, no explanation.',
    '- JSON shape: {"topics":[{"title":{"zh":"","ja":"","en":""},"newsSource":"","tags":["",""]}]}',
    '- `newsSource` should be a concise real-world-style trigger or headline summary, not a URL.',
    '- `tags` should contain 3 to 5 short tags, preferably mixed Chinese/Japanese/English if natural.',
    '- Titles must be natural, specific, and non-duplicative across the 3 topics.',
    '- Avoid placeholders and generic titles like “AI未来如何发展”.',
  ].join('\n');
}

function extractJson(content) {
  const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenceMatch ? fenceMatch[1] : content;
  return JSON.parse(raw);
}

function normalizeTopic(topic) {
  const tags = Array.isArray(topic.tags)
    ? topic.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 5)
    : [];

  return {
    title: {
      zh: String(topic?.title?.zh || '').trim(),
      ja: String(topic?.title?.ja || '').trim(),
      en: String(topic?.title?.en || '').trim(),
    },
    newsSource: String(topic.newsSource || '').trim(),
    tags,
  };
}

async function generateTopics({ session, kimiApiKey }) {
  const date = getTodayInTokyo();
  const response = await fetch(DEFAULT_KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${kimiApiKey}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2.5',
      messages: [{ role: 'user', content: buildPrompt(date, session) }],
      max_tokens: 2000,
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error(`Kimi API failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Kimi API returned empty content');
  }

  const parsed = extractJson(content);
  if (!Array.isArray(parsed.topics) || parsed.topics.length !== 3) {
    throw new Error('Kimi output did not contain exactly 3 topics');
  }

  return parsed.topics.map(normalizeTopic).filter((topic) => {
    return topic.title.zh && topic.title.ja && topic.title.en && topic.newsSource;
  });
}

async function postTopic({ baseUrl, adminKey, session, topic }) {
  const response = await fetch(`${baseUrl}/api/debate/topics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': adminKey,
    },
    body: JSON.stringify({
      session,
      title: topic.title,
      newsSource: topic.newsSource,
      tags: topic.tags,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
}

async function main() {
  const { session } = parseArgs(process.argv.slice(2));
  const kimiApiKey = process.env.KIMI_API_KEY;
  const adminKey = process.env.DEBATE_ADMIN_KEY;
  const baseUrl = DEFAULT_BASE_URL.replace(/\/$/, '');

  if (!kimiApiKey) {
    throw new Error('Missing KIMI_API_KEY');
  }

  if (!adminKey) {
    throw new Error('Missing DEBATE_ADMIN_KEY');
  }

  const topics = await generateTopics({ session, kimiApiKey });
  if (topics.length !== 3) {
    throw new Error(`Expected 3 valid topics, got ${topics.length}`);
  }

  let success = 0;
  let failed = 0;

  for (const topic of topics) {
    const result = await postTopic({ baseUrl, adminKey, session, topic });
    if (result.ok) {
      success += 1;
      console.log(`[OK] ${result.payload.id}: ${topic.title.zh}`);
    } else {
      failed += 1;
      console.error(`[FAIL] ${result.status}: ${topic.title.zh}`);
      console.error(JSON.stringify(result.payload));
    }
  }

  console.log(`成功${success}条/失败${failed}条`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
