/**
 * Redis Service Switcher
 *
 * To use mock Redis (no Redis server needed):
 * 1. Rename this file to redisService.ts
 * 2. Rename the original redisService.ts to redisService.real.ts
 *
 * This allows development without Redis installed.
 */

export { redis, initRedis, closeRedis } from './mockRedisService.js';
