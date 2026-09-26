import { isRateLimited, purgeExpiredEntries } from '@/lib/rateLimiter';

describe('isRateLimited', () => {
  beforeEach(() => {
    // Each test gets fresh timing — use unique keys to avoid cross-test pollution
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows the first request for a new key', () => {
    expect(isRateLimited('test-key-1', 5)).toBe(false);
  });

  it('allows requests up to the limit', () => {
    const key = 'test-key-2';
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited(key, 5)).toBe(false);
    }
  });

  it('blocks requests beyond the limit within the window', () => {
    const key = 'test-key-3';
    for (let i = 0; i < 5; i++) isRateLimited(key, 5);
    expect(isRateLimited(key, 5)).toBe(true);
  });

  it('resets after the window expires', () => {
    const key = 'test-key-4';
    for (let i = 0; i < 5; i++) isRateLimited(key, 5, 1000);
    expect(isRateLimited(key, 5, 1000)).toBe(true);
    // Advance time past the window
    jest.advanceTimersByTime(1500);
    expect(isRateLimited(key, 5, 1000)).toBe(false);
  });

  it('uses separate counters for different keys', () => {
    isRateLimited('key-a-5', 1);
    isRateLimited('key-a-5', 1);
    // key-b-5 should still be allowed
    expect(isRateLimited('key-b-5', 1)).toBe(false);
  });
});

describe('purgeExpiredEntries', () => {
  it('runs without errors', () => {
    expect(() => purgeExpiredEntries()).not.toThrow();
  });
});
