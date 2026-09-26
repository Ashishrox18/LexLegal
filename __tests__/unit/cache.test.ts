import { buildCacheKey, decodeCache, askCache } from '@/lib/cache';

describe('buildCacheKey', () => {
  it('returns a non-empty string', () => {
    const key = buildCacheKey(['hello', 'world']);
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(0);
  });

  it('returns the same key for identical inputs', () => {
    const a = buildCacheKey(['doc text', 'question']);
    const b = buildCacheKey(['doc text', 'question']);
    expect(a).toBe(b);
  });

  it('returns different keys for different inputs', () => {
    const a = buildCacheKey(['doc A']);
    const b = buildCacheKey(['doc B']);
    expect(a).not.toBe(b);
  });

  it('is sensitive to order of parts', () => {
    const a = buildCacheKey(['foo', 'bar']);
    const b = buildCacheKey(['bar', 'foo']);
    expect(a).not.toBe(b);
  });
});

describe('LRU Cache (decodeCache)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null for a missing key', () => {
    expect(decodeCache.get('__nonexistent__')).toBeNull();
  });

  it('stores and retrieves a value', () => {
    const key = buildCacheKey(['test-doc-cache']);
    decodeCache.set(key, { result: 'ok' });
    expect(decodeCache.get(key)).toEqual({ result: 'ok' });
  });

  it('returns null for an expired entry', () => {
    const key = buildCacheKey(['expire-test']);
    // Use askCache which has a 5-minute TTL
    askCache.set(key, { data: 'ephemeral' });
    // Advance past 5-minute TTL
    jest.advanceTimersByTime(6 * 60 * 1000);
    expect(askCache.get(key)).toBeNull();
  });

  it('reports correct size', () => {
    const before = decodeCache.size();
    const key = buildCacheKey(['size-test-' + Math.random()]);
    decodeCache.set(key, { x: 1 });
    expect(decodeCache.size()).toBe(before + 1);
  });
});
