import crypto from 'crypto';
import { redisService } from './redisService';
import type { ApiKeyMetadata, ApiKeyType } from '../types/auth';

// Environment-based keys (never expire)
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const TESTER_API_KEY = process.env.TESTER_API_KEY;

// Rate limits per key type (requests per minute)
const RATE_LIMITS: Record<ApiKeyType, number> = {
  admin: 1000,
  tester: 100,
};

/**
 * Hash an API key using SHA-256
 */
function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Validate an API key and return its metadata
 */
export async function validateApiKey(apiKey: string): Promise<ApiKeyMetadata | null> {
  if (!apiKey || typeof apiKey !== 'string') {
    return null;
  }

  // Check environment-based keys first (no Redis lookup needed)
  if (apiKey === ADMIN_API_KEY) {
    return {
      name: 'Admin Key',
      type: 'admin',
      createdAt: Date.now(),
      lastUsed: Date.now(),
      rateLimit: RATE_LIMITS.admin,
      enabled: true,
    };
  }

  if (apiKey === TESTER_API_KEY) {
    return {
      name: 'Tester Key',
      type: 'tester',
      createdAt: Date.now(),
      lastUsed: Date.now(),
      rateLimit: RATE_LIMITS.tester,
      enabled: true,
    };
  }

  // Check Redis for other keys (future functionality)
  const hashedKey = hashApiKey(apiKey);
  const redisKey = `apikey:${hashedKey}`;

  try {
    const metadata = await redisService.get<ApiKeyMetadata>(redisKey);

    if (!metadata) {
      return null;
    }

    // Check if key is enabled
    if (!metadata.enabled) {
      return null;
    }

    // Check if key has expired
    if (metadata.expiresAt && metadata.expiresAt < Date.now()) {
      return null;
    }

    // Update last used timestamp
    metadata.lastUsed = Date.now();
    await redisService.set(redisKey, metadata);

    return metadata;
  } catch (error) {
    console.error('[ApiKeyService] Error validating key:', error);
    return null;
  }
}

/**
 * Store a new API key in Redis
 */
export async function storeApiKey(
  apiKey: string,
  metadata: Omit<ApiKeyMetadata, 'lastUsed'>
): Promise<void> {
  const hashedKey = hashApiKey(apiKey);
  const redisKey = `apikey:${hashedKey}`;

  const fullMetadata: ApiKeyMetadata = {
    ...metadata,
    lastUsed: Date.now(),
  };

  await redisService.set(redisKey, fullMetadata);

  // Set expiration if specified
  if (metadata.expiresAt) {
    const ttl = Math.floor((metadata.expiresAt - Date.now()) / 1000);
    if (ttl > 0) {
      await redisService.client.expire(redisKey, ttl);
    }
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(apiKey: string): Promise<boolean> {
  const hashedKey = hashApiKey(apiKey);
  const redisKey = `apikey:${hashedKey}`;

  const metadata = await redisService.get<ApiKeyMetadata>(redisKey);
  if (!metadata) {
    return false;
  }

  metadata.enabled = false;
  await redisService.set(redisKey, metadata);
  return true;
}

/**
 * Generate a new API key
 */
export function generateApiKey(prefix: string = 'key'): string {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return `${prefix}_${randomBytes}`;
}
