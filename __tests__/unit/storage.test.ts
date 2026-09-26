import { Storage, safeGet, safeSet } from '@/lib/storage';
import { StorageSchema } from '@/schemas/ai-responses';

describe('Safe localStorage Layer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('getUserId returns consistent UUID on repeated calls', () => {
    const id1 = Storage.getUserId();
    const id2 = Storage.getUserId();
    expect(id1).toBeDefined();
    expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(id1).toBe(id2);
  });

  test('safeGet returns null when localStorage is empty', () => {
    const data = safeGet(StorageSchema);
    expect(data).toBeNull();
  });

  test('safeGet returns null and clears when JSON is corrupted (SyntaxError)', () => {
    localStorage.setItem('lexai_data', 'corrupted_invalid_json{{{');
    const data = safeGet(StorageSchema);
    expect(data).toBeNull();
    expect(localStorage.getItem('lexai_data')).toBeNull();
  });

  test('safeGet returns null when schema is invalid (wrong types)', () => {
    localStorage.setItem('lexai_data', JSON.stringify({ version: 123, userId: 'not-a-uuid', history: 'invalid' }));
    const data = safeGet(StorageSchema);
    expect(data).toBeNull();
    expect(localStorage.getItem('lexai_data')).toBeNull();
  });

  test('safeSet refuses to write schema-invalid data (returns false)', () => {
    const invalidData = { version: '1.0.0', userId: 'invalid-id', history: [] };
    const success = safeSet(StorageSchema, invalidData as any);
    expect(success).toBe(false);
  });

  test('addToHistory stores item and returns true', () => {
    const success = Storage.addToHistory({
      mode: 'decode',
      documentType: 'rental_agreement',
      riskScore: 20,
      summary: 'Test summary',
    });
    expect(success).toBe(true);
    expect(Storage.getHistory().length).toBe(1);
    expect(Storage.getHistory()[0].documentType).toBe('rental_agreement');
  });

  test('history is capped at 20 items (oldest removed)', () => {
    for (let i = 0; i < 25; i++) {
      Storage.addToHistory({
        mode: 'decode',
        documentType: `doc_${i}`,
        riskScore: i,
        summary: `Summary ${i}`,
      });
    }
    const history = Storage.getHistory();
    expect(history.length).toBe(20);
    expect(history[0].documentType).toBe('doc_24');
  });
});
