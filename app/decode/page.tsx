'use client';

import React from 'react';
import { useDecodeStore } from '@/hooks/useDecodeStore';
import { DocumentUpload } from '@/components/ui/DocumentUpload';
import { LoadingAnalysis } from '@/components/ui/LoadingAnalysis';
import { DecodeResults } from '@/components/features/DecodeResults';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Storage } from '@/lib/storage';
import { AlertCircle } from 'lucide-react';

export default function DecodePage() {
  const {
    documentText,
    isAnalyzing,
    error,
    results,
    setDocumentText,
    setIsAnalyzing,
    setError,
    setResults,
  } = useDecodeStore();

  const handleAnalyze = async (text: string) => {
    setDocumentText(text);
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: text,
          userId: Storage.getUserId(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze document.');
      }

      setResults(data);

      // Save to localStorage history
      Storage.addToHistory({
        mode: 'decode',
        documentType: data.documentType,
        riskScore: data.riskScore,
        summary: data.summary,
      });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed.';
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-8 py-4">
        {/* Header */}
        {!results && !isAnalyzing && (
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold font-serif-legal text-text-primary">
              Document Decoder Workspace
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Paste or upload your contract, lease, NDA, or legal notice.
              LexAI extracts plain-English meanings, highlights risks, and cites relevant Indian laws.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div role="alert" className="max-w-2xl mx-auto p-4 bg-danger-muted border border-danger/40 rounded-xl flex items-center gap-3 text-xs text-danger shadow-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* State Machine Views */}
        {isAnalyzing ? (
          <LoadingAnalysis />
        ) : results ? (
          <DecodeResults data={results} />
        ) : (
          <div className="max-w-3xl mx-auto">
            <DocumentUpload onDocumentSubmit={handleAnalyze} isLoading={isAnalyzing} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
