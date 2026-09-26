import { ZodSchema } from 'zod';
import { StorageSchema, HistoryItemSchema, HistoryItem } from '@/schemas/ai-responses';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_VERSION = '1.0.0';
const STORAGE_KEY = 'lexai_data';

export function safeGet<T>(schema: ZodSchema<T>): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.warn('[LexAI] Syntax error in storage. Clearing.');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const result = schema.safeParse(parsed);
    if (!result.success) {
      console.warn('[LexAI] Corrupted storage detected. Resetting.', result.error.issues);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return result.data;
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    return null; // Never crash on storage failure
  }
}

export function safeSet<T>(schema: ZodSchema<T>, data: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const result = schema.safeParse(data);
    if (!result.success) {
      console.error('[LexAI] Refusing to write invalid data', result.error.issues);
      return false;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
    return true;
  } catch {
    return false;
  }
}

export function getOrCreateStore() {
  const existing = safeGet(StorageSchema);
  if (existing) return existing;
  // Fresh store
  const fresh = {
    version: STORAGE_VERSION,
    userId: uuidv4(),
    history: [],
  };
  safeSet(StorageSchema, fresh);
  return fresh;
}

export const Storage = {
  getUserId: (): string => getOrCreateStore().userId,
  
  getHistory: (): HistoryItem[] => getOrCreateStore().history ?? [],
  
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>): boolean => {
    const store = getOrCreateStore();
    const newItem = {
      ...item,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    const parsed = HistoryItemSchema.safeParse(newItem);
    if (!parsed.success) return false;
    store.history = [parsed.data, ...(store.history ?? [])].slice(0, 20);
    return safeSet(StorageSchema, store);
  },

  clearHistory: (): boolean => {
    const store = getOrCreateStore();
    store.history = [];
    return safeSet(StorageSchema, store);
  },
};
