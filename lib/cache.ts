/**
 * Lightweight in-memory LRU response cache for AI API routes.
 * Prevents duplicate LLM calls for identical document inputs.
 * Cache is scoped per-process (server-side only).
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class LRUCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;
  private readonly ttlMs: number;

  constructor(maxSize = 50, ttlMs = 10 * 60_000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    // LRU: move to end on access
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    // Evict oldest if at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  size(): number {
    return this.store.size;
  }
}

// Separate cache instances per feature (10 min TTL, 50 entries each)
export const decodeCache = new LRUCache<unknown>(50, 10 * 60_000);
export const compareCache = new LRUCache<unknown>(30, 10 * 60_000);
export const askCache = new LRUCache<unknown>(100, 5 * 60_000);

/**
 * Build a stable cache key by hashing the content.
 * Uses a simple djb2 hash — fast and collision-resistant enough for caching.
 */
export function buildCacheKey(parts: string[]): string {
  const str = parts.join('||');
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
