import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = createClient({
  url: redisUrl,
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis Client Connected'));

/**
 * Initialize Redis connection
 */
export async function initRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis() {
  if (redis.isOpen) {
    await redis.quit();
  }
}
