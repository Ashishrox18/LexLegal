/**
 * Shared in-memory rate limiter.
 * Centralised here to avoid duplicating the Map across every API route.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Returns true when the caller should be rejected.
 * @param key      – unique key (e.g. userId + route)
 * @param limit    – max requests allowed per window
 * @param windowMs – window size in milliseconds (default: 60 s)
 */
export function isRateLimited(
  key: string,
  limit = 10,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) return true;

  entry.count++;
  return false;
}

/** Purge expired entries to prevent unbounded memory growth. */
export function purgeExpiredEntries(): void {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, entry]) => {
    if (now > entry.resetAt) store.delete(key);
  });
}

// Auto-purge every 5 minutes in long-running server environments
if (typeof setInterval !== 'undefined') {
  setInterval(purgeExpiredEntries, 5 * 60_000);
}
