import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
  redisClient = createClient({ url });

  redisClient.on('error', () => {
    // Handle error silently - will be caught in get/set/del calls
  });

  redisClient.on('connect', () => {
    // Connected
  });

  await redisClient.connect();
  return redisClient;
}

export const redis = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await getRedisClient();
      const value = await client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Redis get error for key ${key}:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const client = await getRedisClient();
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, serialized);
      } else {
        await client.set(key, serialized);
      }
    } catch (error) {
      console.error(`Redis set error for key ${key}:`, error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.del(key);
    } catch (error) {
      console.error(`Redis del error for key ${key}:`, error);
    }
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      const client = await getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      console.error(`Redis delPattern error for pattern ${pattern}:`, error);
    }
  },

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.expire(key, ttlSeconds);
    } catch (error) {
      console.error(`Redis expire error for key ${key}:`, error);
    }
  },

  async flushAll(): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.flushAll();
    } catch (error) {
      console.error('Redis flushAll error:', error);
    }
  },

  async disconnect(): Promise<void> {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
    }
  },
};
