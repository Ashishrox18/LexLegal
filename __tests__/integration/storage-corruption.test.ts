import { Storage, safeGet } from '@/lib/storage';
import { StorageSchema } from '@/schemas/ai-responses';

describe('Storage Corruption Recovery Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('app initializes fresh store when localStorage is completely empty', () => {
    const userId = Storage.getUserId();
    expect(userId).toBeDefined();
    expect(Storage.getHistory()).toEqual([]);
  });

  test('app recovers when stored JSON is malformed syntax', () => {
    localStorage.setItem('lexai_data', '{malformed json string');
    const history = Storage.getHistory();
    expect(history).toEqual([]);
  });

  test('app recovers when stored data has invalid schema version or type', () => {
    localStorage.setItem('lexai_data', JSON.stringify({ version: '99.0.0', userId: 'invalid-id', history: 'bad' }));
    const history = Storage.getHistory();
    expect(history).toEqual([]);
  });

  test('corrupted history returns fresh store upon recovery', () => {
    localStorage.setItem('lexai_data', JSON.stringify({
      version: '1.0.0',
      userId: '12345678-1234-1234-1234-123456789012',
      history: [{ badKey: 'corrupted' }]
    }));
    const history = Storage.getHistory();
    expect(history).toEqual([]);
  });
});
