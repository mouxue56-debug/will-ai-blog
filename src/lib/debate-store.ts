import { debates } from '@/data/debates';
import { supabaseAdmin } from '@/lib/supabase';

export type DebateLocale = 'zh' | 'ja' | 'en';
export type DebateSession = 'morning' | 'evening';
export type DebateStance = 'pro' | 'con' | 'neutral';

export interface DebateTopic {
  id: string;
  date: string;
  session: DebateSession;
  title: Record<DebateLocale, string>;
  newsSource: string;
  newsDate?: string;
  tags: string[];
  createdAt?: string;
  /** Article body from daily_reports.content_zh/ja/en */
  body?: Partial<Record<DebateLocale, string>>;
}

export interface DebateOpinionRecord {
  id: string;
  topicId: string;
  model: string;
  stance: DebateStance;
  opinion: {
    zh: string;
    ja?: string;
    en?: string;
  };
  isAI?: boolean;
  replyTo?: string;
  ipHash?: string;
  instanceName?: string;
  submittedBy?: string;
  createdAt: string;
}

/** Max submissions per IP per day */
const DAILY_IP_LIMIT = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getTodayInTokyo(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function buildTopicId(date: string, session: DebateSession, index = 1): string {
  return index <= 1 ? `${date}-${session}` : `${date}-${session}-${index}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static (hardcoded) debate helpers — kept for fallback / legacy frontend
// ─────────────────────────────────────────────────────────────────────────────

export function getStaticDebateTopic(topicId: string): DebateTopic | null {
  const debate = debates.find((item) => buildTopicId(item.date, item.session) === topicId);

  if (!debate) {
    return null;
  }

  return {
    id: topicId,
    date: debate.date,
    session: debate.session,
    title: debate.topic,
    newsSource: debate.newsSource,
    tags: debate.tags,
  };
}

export function getStaticTopicsForDate(date: string): DebateTopic[] {
  return debates
    .filter((item) => item.date === date)
    .map((item) => ({
      id: buildTopicId(item.date, item.session),
      date: item.date,
      session: item.session,
      title: item.topic,
      newsSource: item.newsSource,
      tags: item.tags,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase: topic helpers
// ─────────────────────────────────────────────────────────────────────────────

function rowToTopic(row: Record<string, unknown>): DebateTopic {
  return {
    id: row.id as string,
    date: row.date as string,
    session: row.session as DebateSession,
    title: {
      zh: row.title_zh as string,
      ja: (row.title_ja as string) ?? '',
      en: (row.title_en as string) ?? '',
    },
    newsSource: (row.news_source as string) ?? '',
    tags: (row.tags as string[]) ?? [],
    createdAt: row.created_at as string,
  };
}

export async function getDebateTopic(topicId: string): Promise<DebateTopic | null> {
  try {
    // First try to find the topic in Supabase by matching date+session pattern
    const staticTopic = getStaticDebateTopic(topicId);
    
    // Try debate_topics table first
    const { data, error } = await supabaseAdmin
      .from('debate_topics')
      .select('*')
      .eq('id', topicId)
      .maybeSingle();

    if (!error && data) {
      return rowToTopic(data as Record<string, unknown>);
    }

    // Fallback: check daily_reports table (topics from cron-generated reports)
    const { data: report } = await supabaseAdmin
      .from('daily_reports')
      .select('id, title, title_zh, title_ja, title_en, topic_type, slug, published_at, content_zh, content_ja, content_en, content')
      .eq('id', topicId)
      .maybeSingle();

    if (report) {
      const r = report as Record<string, string | null>;
      const titleZh = r.title_zh || r.title || '';
      const titleJa = r.title_ja || r.title_zh || r.title || '';
      const titleEn = r.title_en || r.title_zh || r.title || '';
      return {
        id: r.id as string,
        date: (r.published_at ?? '').slice(0, 10) || getTodayInTokyo(),
        session: 'evening' as DebateSession,
        title: { zh: titleZh, ja: titleJa, en: titleEn },
        newsSource: titleZh,
        newsDate: (r.published_at ?? '').slice(0, 10),
        tags: [r.topic_type || 'ai'],
        createdAt: r.published_at ?? undefined,
        body: {
          zh: r.content_zh || undefined,
          ja: r.content_ja || undefined,
          en: r.content_en || r.content || undefined,
        },
      };
    }

    return staticTopic;
  } catch {
    return getStaticDebateTopic(topicId);
  }
}

async function listStoredTopicsForDate(date: string): Promise<DebateTopic[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('debate_topics')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return (data as Record<string, unknown>[]).map(rowToTopic);
  } catch {
    return [];
  }
}

function compareTopics(a: DebateTopic, b: DebateTopic): number {
  if (a.session !== b.session) {
    return a.session === 'morning' ? -1 : 1;
  }
  return (a.createdAt ?? '').localeCompare(b.createdAt ?? '') || a.id.localeCompare(b.id);
}

export async function listDebateTopicsForDate(date: string): Promise<DebateTopic[]> {
  const fallbackTopics = getStaticTopicsForDate(date);

  try {
    const storedTopics = await listStoredTopicsForDate(date);
    const merged = new Map<string, DebateTopic>();

    fallbackTopics.forEach((topic) => merged.set(topic.id, topic));
    storedTopics.forEach((topic) => merged.set(topic.id, topic));

    return Array.from(merged.values()).sort(compareTopics);
  } catch {
    return fallbackTopics;
  }
}

export async function getTodayDebateTopics(): Promise<DebateTopic[]> {
  return listDebateTopicsForDate(getTodayInTokyo());
}

export async function saveDebateTopic(topic: DebateTopic): Promise<boolean> {
  try {
    // debate_topics.id is UUID type; use randomUUID and store slug separately
    const uuid = crypto.randomUUID();
    const { error } = await supabaseAdmin.from('debate_topics').upsert({
      id: uuid,
      slug: topic.id,          // store the human-readable id (e.g. "2026-03-23-morning") as slug
      date: topic.date,
      session: topic.session,
      title_zh: topic.title.zh,
      title_ja: topic.title.ja ?? null,
      title_en: topic.title.en ?? null,
      news_source: topic.newsSource,
      tags: topic.tags,
      created_at: topic.createdAt ?? new Date().toISOString(),
    });

    if (error) {
      // Fallback: try without slug column in case it doesn't exist yet
      const { error: error2 } = await supabaseAdmin.from('debate_topics').upsert({
        id: uuid,
        date: topic.date,
        session: topic.session,
        title_zh: topic.title.zh,
        title_ja: topic.title.ja ?? null,
        title_en: topic.title.en ?? null,
        news_source: topic.newsSource,
        tags: topic.tags,
        created_at: topic.createdAt ?? new Date().toISOString(),
      });
      return !error2;
    }

    return true;
  } catch {
    return false;
  }
}

export async function createDebateTopic(
  input: Omit<DebateTopic, 'id' | 'createdAt'>,
): Promise<DebateTopic | null> {
  const dateTopics = await listDebateTopicsForDate(input.date);
  const nextIndex = dateTopics.filter((topic) => topic.session === input.session).length + 1;
  const topic: DebateTopic = {
    ...input,
    id: buildTopicId(input.date, input.session, nextIndex),
    createdAt: new Date().toISOString(),
  };

  const saved = await saveDebateTopic(topic);
  return saved ? topic : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase: opinion helpers
// ─────────────────────────────────────────────────────────────────────────────

function rowToOpinion(row: Record<string, unknown>): DebateOpinionRecord {
  return {
    id: row.id as string,
    topicId: row.topic_id as string,
    model: row.model as string,
    stance: row.stance as DebateStance,
    opinion: {
      zh: row.opinion_zh as string,
      ja: row.opinion_ja as string | undefined,
      en: row.opinion_en as string | undefined,
    },
    isAI: row.is_ai as boolean,
    replyTo: row.reply_to as string | undefined,
    ipHash: row.ip_hash as string | undefined,
    instanceName: row.instance_name as string | undefined,
    createdAt: row.created_at as string,
  };
}

export async function saveDebateOpinion(opinion: DebateOpinionRecord): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('debate_opinions').insert({
      id: opinion.id,
      topic_id: opinion.topicId,
      model: opinion.model,
      stance: opinion.stance,
      opinion_zh: opinion.opinion.zh,
      opinion_ja: opinion.opinion.ja ?? null,
      opinion_en: opinion.opinion.en ?? null,
      is_ai: opinion.isAI ?? true,
      reply_to: opinion.replyTo ?? null,
      ip_hash: opinion.ipHash ?? null,
      instance_name: opinion.instanceName ?? null,
      created_at: opinion.createdAt,
    });

    return !error;
  } catch {
    return false;
  }
}

export async function listDebateOpinions(topicId: string, limit = 4): Promise<DebateOpinionRecord[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('debate_opinions')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return (data as Record<string, unknown>[]).map(rowToOpinion);
  } catch {
    return [];
  }
}

export async function getOpinionReplies(opinionId: string): Promise<DebateOpinionRecord[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('debate_opinions')
      .select('*')
      .eq('reply_to', opinionId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return (data as Record<string, unknown>[]).map(rowToOpinion);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IP Rate limiting — Supabase debate_rate_limits table
// ─────────────────────────────────────────────────────────────────────────────

export async function checkAndIncrementRateLimit(
  ipHash: string,
): Promise<{ allowed: boolean; remaining: number }> {
  const date = getTodayInTokyo();

  try {
    // Try to insert first; if row exists, update count
    const { data: existingRow } = await supabaseAdmin
      .from('debate_rate_limits')
      .select('count')
      .eq('ip_hash', ipHash)
      .eq('date', date)
      .maybeSingle();

    const currentCount = (existingRow?.count as number) ?? 0;

    if (currentCount >= DAILY_IP_LIMIT) {
      return { allowed: false, remaining: 0 };
    }

    // Upsert: insert or increment
    const { error } = await supabaseAdmin.from('debate_rate_limits').upsert(
      {
        ip_hash: ipHash,
        date,
        count: currentCount + 1,
      },
      { onConflict: 'ip_hash,date' },
    );

    if (error) {
      // On upsert error, allow but warn (fail open to avoid blocking legit users)
      return { allowed: true, remaining: DAILY_IP_LIMIT - 1 };
    }

    return {
      allowed: true,
      remaining: DAILY_IP_LIMIT - (currentCount + 1),
    };
  } catch {
    // Fail open
    return { allowed: true, remaining: DAILY_IP_LIMIT - 1 };
  }
}

