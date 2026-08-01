import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let client: ReturnType<typeof createClient> | null = null;
let connected = false;

export async function getRedis() {
  if (!client) {
    client = createClient({ 
      url: REDIS_URL,
      socket: { reconnectStrategy: false }
    });

    client.on("error", (err) => {
      // Silently log, don't crash the app if Redis is unavailable
      console.warn("[Redis] Connection error:", err.message);
      connected = false;
    });

    client.on("connect", () => {
      connected = true;
      console.log("[Redis] Connected ✓");
    });

    try {
      await client.connect();
    } catch (err: any) {
      console.warn("[Redis] Could not connect, caching disabled:", err.message);
    }
  }
  return { client, connected };
}

/** Get a cached JSON value. Returns null if miss or Redis is down. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const { client, connected } = await getRedis();
    if (!connected) return null;
    const raw = await client!.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Set a JSON value in cache with a TTL in seconds (default: 60s). */
export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  try {
    const { client, connected } = await getRedis();
    if (!connected) return;
    await client!.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
    // noop
  }
}

/** Delete one or more cache keys (call after mutations). */
export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    const { client, connected } = await getRedis();
    if (!connected) return;
    await client!.del(keys);
  } catch {
    // noop
  }
}
