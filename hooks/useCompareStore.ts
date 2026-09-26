import { create } from 'zustand';
import { CompareResponse } from '@/types';

interface CompareState {
  docAText: string;
  docBText: string;
  isComparing: boolean;
  error: string | null;
  results: CompareResponse | null;
  setDocAText: (text: string) => void;
  setDocBText: (text: string) => void;
  setIsComparing: (comparing: boolean) => void;
  setError: (error: string | null) => void;
  setResults: (results: CompareResponse | null) => void;
  reset: () => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  docAText: '',
  docBText: '',
  isComparing: false,
  error: null,
  results: null,
  setDocAText: (docAText) => set({ docAText }),
  setDocBText: (docBText) => set({ docBText }),
  setIsComparing: (isComparing) => set({ isComparing }),
  setError: (error) => set({ error }),
  setResults: (results) => set({ results }),
  reset: () => set({ docAText: '', docBText: '', isComparing: false, error: null, results: null }),
}));
