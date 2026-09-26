import { useState, useEffect, useCallback } from 'react';
import { Storage } from '@/lib/storage';
import { HistoryItem } from '@/types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userId, setUserId] = useState<string>('');

  const refreshHistory = useCallback(() => {
    setHistory(Storage.getHistory());
    setUserId(Storage.getUserId());
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const success = Storage.addToHistory(item);
    if (success) {
      refreshHistory();
    }
    return success;
  };

  const clearAllHistory = () => {
    const success = Storage.clearHistory();
    if (success) {
      refreshHistory();
    }
    return success;
  };

  return {
    history,
    userId,
    addHistoryItem,
    clearAllHistory,
    refreshHistory,
  };
}
