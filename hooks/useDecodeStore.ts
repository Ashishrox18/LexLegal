import { create } from 'zustand';
import { DecodeResponse } from '@/types';

interface DecodeState {
  documentText: string;
  isAnalyzing: boolean;
  error: string | null;
  results: DecodeResponse | null;
  setDocumentText: (text: string) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;
  setResults: (results: DecodeResponse | null) => void;
  reset: () => void;
}

export const useDecodeStore = create<DecodeState>((set) => ({
  documentText: '',
  isAnalyzing: false,
  error: null,
  results: null,
  setDocumentText: (documentText) => set({ documentText }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setError: (error) => set({ error }),
  setResults: (results) => set({ results }),
  reset: () => set({ documentText: '', isAnalyzing: false, error: null, results: null }),
}));
