/**
 * Redis Client Singleton for ThesisAI
 * Provides a single shared Redis connection with automatic in-memory fallback
 * Following the recommended singleton pattern with global declaration
 */

import Redis from "ioredis";

// Environment variables
const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

let redisClient: Redis;

// Global singleton for Redis connection (persists across hot reloads in dev)
declare global {
  // eslint-disable-next-line no-var
  var _thesisaiRedis: Redis | undefined;
}

/**
 * In-memory fallback storage
 * Used when Redis is not available
 */
interface InMemoryRecord {
  count: number;
  timestamp: number;
  value: string;
}

const inMemoryStore = new Map<string, InMemoryRecord>();

/**
 * Initialize Redis singleton connection
 */
if (REDIS_ENABLED && !global._thesisaiRedis) {
  try {
    const options: any = {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
    };

    if (REDIS_PASSWORD) {
      options.password = REDIS_PASSWORD;
    }

    redisClient = new Redis(REDIS_URL, options);

    // Event handlers for monitoring
    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully to:', REDIS_URL);
    });

    redisClient.on('ready', () => {
      console.log('[Redis] Ready to accept commands');
    });

    redisClient.on('error', (error: Error) => {
      console.warn('[Redis] Connection error:', error.message);
    });

    redisClient.on('close', () => {
      console.log('[Redis] Connection closed');
    });

    global._thesisaiRedis = redisClient;
  } catch (error) {
    console.error('[Redis] Failed to initialize:', error);
    global._thesisaiRedis = undefined;
  }
}

// Assign singleton to client variable
redisClient = global._thesisaiRedis!;

/**
 * Check if Redis is connected and available
 */
export function isRedisAvailable(): boolean {
  return !!redisClient && REDIS_ENABLED;
}

/**
 * Get value from Redis or in-memory fallback
 */
export async function get(key: string): Promise<string | null> {
  try {
    if (isRedisAvailable() && redisClient) {
      const value = await redisClient.get(key);
      return value;
    }
  } catch (error) {
    console.warn('[Redis] Get error, falling back to memory:', error);
  }

  // In-memory fallback
  const record = inMemoryStore.get(key);
  if (!record) {
    return null;
  }

  // Check TTL
  if (Date.now() > record.timestamp) {
    inMemoryStore.delete(key);
    return null;
  }

  return record.value;
}

/**
 * Set value with TTL (seconds)
 */
export async function set(key: string, value: string, ttlSeconds: number): Promise<void> {
  try {
    if (isRedisAvailable() && redisClient) {
      await redisClient.setex(key, ttlSeconds, value);
      return;
    }
  } catch (error) {
    console.warn('[Redis] Set error, using in-memory fallback:', error);
  }

  // In-memory fallback
  inMemoryStore.set(key, {
    value,
    timestamp: Date.now() + (ttlSeconds * 1000),
  });

  // Cleanup expired records periodically
  if (inMemoryStore.size > 10000) {
    cleanupInMemoryStore();
  }
}

/**
 * Increment value with TTL
 */
export async function increment(key: string, ttlSeconds: number): Promise<number> {
  try {
    if (isRedisAvailable() && redisClient) {
      const result = await redisClient.incr(key);
      // Set expiry only on first increment
      if (result === 1) {
        await redisClient.expire(key, ttlSeconds);
      }
      return result;
    }
  } catch (error) {
    console.warn('[Redis] Increment error, using in-memory fallback:', error);
  }

  // In-memory fallback
  const now = Date.now();
  const record = inMemoryStore.get(key);

  if (!record || now > record.timestamp) {
    inMemoryStore.set(key, {
      value: '1',
      count: 1,
      timestamp: now + (ttlSeconds * 1000),
    });
    return 1;
  }

  const count = record.count + 1;
  inMemoryStore.set(key, {
    ...record,
    count,
    value: String(count),
  });

  // Cleanup expired records periodically
  if (inMemoryStore.size > 10000) {
    cleanupInMemoryStore();
  }

  return count;
}

/**
 * Delete key
 */
export async function del(key: string): Promise<void> {
  try {
    if (isRedisAvailable() && redisClient) {
      await redisClient.del(key);
      return;
    }
  } catch (error) {
    console.warn('[Redis] Delete error:', error);
  }

  // In-memory fallback
  inMemoryStore.delete(key);
}

/**
 * Get multiple keys matching pattern
 */
export async function keys(pattern: string): Promise<string[]> {
  try {
    if (isRedisAvailable() && redisClient) {
      return await redisClient.keys(pattern);
    }
  } catch (error) {
    console.warn('[Redis] Keys error:', error);
  }

  // In-memory fallback
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  return Array.from(inMemoryStore.keys()).filter(key => regex.test(key));
}

/**
 * Cleanup expired in-memory records
 */
function cleanupInMemoryStore(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, record] of inMemoryStore.entries()) {
    if (now > record.timestamp) {
      keysToDelete.push(key);
    }
  }

  for (const key of keysToDelete) {
    inMemoryStore.delete(key);
  }

  if (keysToDelete.length > 0) {
    console.log(`[Redis] Cleaned up ${keysToDelete.length} expired in-memory records`);
  }
}

/**
 * Get connection status
 */
export function getConnectionStatus(): {
  connected: boolean;
  usingFallback: boolean;
  redisAvailable: boolean;
  url: string;
  inMemoryCount: number;
} {
  return {
    connected: !!redisClient && REDIS_ENABLED,
    usingFallback: !isRedisAvailable(),
    redisAvailable: isRedisAvailable(),
    url: REDIS_URL,
    inMemoryCount: inMemoryStore.size,
  };
}

/**
 * Close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient && REDIS_ENABLED) {
    await redisClient.quit();
    global._thesisaiRedis = undefined;
    console.log('[Redis] Connection closed');
  }
}

// Export the singleton client for direct use
export { redisClient as redis };

// Handle process shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', closeRedisConnection);
  process.on('SIGTERM', closeRedisConnection);
}

export default {
  redisClient,
  get,
  set,
  increment,
  del,
  keys,
  getConnectionStatus,
  closeRedisConnection,
};
