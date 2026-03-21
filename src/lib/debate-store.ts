import { debates } from '@/data/debates';
import { getRedis } from '@/lib/redis';

export type DebateLocale = 'zh' | 'ja' | 'en';
export type DebateSession = 'morning' | 'evening';
export type DebateStance = 'pro' | 'con' | 'neutral';

export interface DebateTopic {
  id: string;
  date: string;
  session: DebateSession;
  title: Record<DebateLocale, string>;
  newsSource: string;
  tags: string[];
  createdAt?: string;
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
  submittedBy?: string;
  createdAt: string;
}

const TOPIC_PREFIX = 'debate:topic:';
const TOPIC_INDEX_KEY = 'debate:topics:list';
const OPINION_PREFIX = 'debate:opinion:';
const OPINION_LIST_PREFIX = 'debate:opinions:';

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

function topicKey(topicId: string): string {
  return `${TOPIC_PREFIX}${topicId}`;
}

function opinionKey(topicId: string, opinionId: string): string {
  return `${OPINION_PREFIX}${topicId}:${opinionId}`;
}

function opinionListKey(topicId: string): string {
  return `${OPINION_LIST_PREFIX}${topicId}`;
}

function parseTopicHash(data: Record<string, string> | null): DebateTopic | null {
  if (!data?.id || !data.date || !data.session || !data.title || !data.newsSource) {
    return null;
  }

  try {
    return {
      id: data.id,
      date: data.date,
      session: data.session as DebateSession,
      title: JSON.parse(data.title) as DebateTopic['title'],
      newsSource: data.newsSource,
      tags: data.tags ? (JSON.parse(data.tags) as string[]) : [],
      createdAt: data.createdAt,
    };
  } catch {
    return null;
  }
}

function parseOpinionHash(data: Record<string, string> | null): DebateOpinionRecord | null {
  if (!data?.id || !data.topicId || !data.model || !data.stance || !data.opinion || !data.createdAt) {
    return null;
  }

  try {
    return {
      id: data.id,
      topicId: data.topicId,
      model: data.model,
      stance: data.stance as DebateStance,
      opinion: JSON.parse(data.opinion) as DebateOpinionRecord['opinion'],
      submittedBy: data.submittedBy || undefined,
      createdAt: data.createdAt,
    };
  } catch {
    return null;
  }
}

function compareTopics(a: DebateTopic, b: DebateTopic): number {
  if (a.session !== b.session) {
    return a.session === 'morning' ? -1 : 1;
  }

  return (a.createdAt ?? '').localeCompare(b.createdAt ?? '') || a.id.localeCompare(b.id);
}

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

async function listStoredTopicsForDate(date: string): Promise<DebateTopic[]> {
  const client = getRedis();
  if (!client) {
    return [];
  }

  try {
    const topicIds = ((await client.zrange(TOPIC_INDEX_KEY, 0, -1)) as string[])
      .filter((topicId) => topicId.startsWith(`${date}-`));

    if (!topicIds.length) {
      return [];
    }

    const records = await Promise.all(
      topicIds.map((topicId) => client.hgetall(topicKey(topicId)) as Promise<Record<string, string> | null>),
    );

    return records
      .map((record) => parseTopicHash(record))
      .filter((topic): topic is DebateTopic => Boolean(topic))
      .sort(compareTopics);
  } catch {
    return [];
  }
}

export async function getDebateTopic(topicId: string): Promise<DebateTopic | null> {
  const client = getRedis();
  if (!client) {
    return getStaticDebateTopic(topicId);
  }

  try {
    const data = (await client.hgetall(topicKey(topicId))) as Record<string, string> | null;
    return parseTopicHash(data) ?? getStaticDebateTopic(topicId);
  } catch {
    return getStaticDebateTopic(topicId);
  }
}

export async function listDebateTopicsForDate(date: string): Promise<DebateTopic[]> {
  const client = getRedis();
  const fallbackTopics = getStaticTopicsForDate(date);

  if (!client) {
    return fallbackTopics;
  }

  try {
    const merged = new Map<string, DebateTopic>();
    const storedTopics = await listStoredTopicsForDate(date);

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
  const client = getRedis();
  if (!client) {
    return false;
  }

  try {
    await client.hset(topicKey(topic.id), {
      id: topic.id,
      date: topic.date,
      session: topic.session,
      title: JSON.stringify(topic.title),
      newsSource: topic.newsSource,
      tags: JSON.stringify(topic.tags),
      createdAt: topic.createdAt ?? new Date().toISOString(),
    });

    await client.zadd(TOPIC_INDEX_KEY, {
      score: Date.now(),
      member: topic.id,
    });

    return true;
  } catch {
    return false;
  }
}

export async function createDebateTopic(input: Omit<DebateTopic, 'id' | 'createdAt'>): Promise<DebateTopic | null> {
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

export async function saveDebateOpinion(opinion: DebateOpinionRecord): Promise<boolean> {
  const client = getRedis();
  if (!client) {
    return false;
  }

  const key = opinionKey(opinion.topicId, opinion.id);

  try {
    await client.hset(key, {
      id: opinion.id,
      topicId: opinion.topicId,
      model: opinion.model,
      stance: opinion.stance,
      opinion: JSON.stringify(opinion.opinion),
      submittedBy: opinion.submittedBy ?? '',
      createdAt: opinion.createdAt,
    });

    await client.lpush(opinionListKey(opinion.topicId), key);
    return true;
  } catch {
    return false;
  }
}

export async function listDebateOpinions(topicId: string): Promise<DebateOpinionRecord[]> {
  const client = getRedis();
  if (!client) {
    return [];
  }

  try {
    const keys = (await client.lrange(opinionListKey(topicId), 0, 99)) as string[];
    if (!keys.length) {
      return [];
    }

    const records = await Promise.all(
      keys.map((key) => client.hgetall(key) as Promise<Record<string, string> | null>),
    );

    return records
      .map((record) => parseOpinionHash(record))
      .filter((record): record is DebateOpinionRecord => Boolean(record));
  } catch {
    return [];
  }
}

export async function incrementOpinionRateLimit(apiKey: string): Promise<number | null> {
  const client = getRedis();
  if (!client) {
    return null;
  }

  const hourBucket = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  })
    .format(new Date())
    .replace(/[^\d]/g, '');

  const key = `debate:ratelimit:${apiKey}:${hourBucket}`;

  try {
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, 3600);
    }

    return count;
  } catch {
    return null;
  }
}
