import { Redis } from '@upstash/redis';

// Graceful fallback when Redis is not configured
let _redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (_redis) return _redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  try {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return _redis;
  } catch {
    return null;
  }
}
