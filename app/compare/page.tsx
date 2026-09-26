'use client';

import React from 'react';
import { useCompareStore } from '@/hooks/useCompareStore';
import { DocumentUpload } from '@/components/ui/DocumentUpload';
import { LoadingAnalysis } from '@/components/ui/LoadingAnalysis';
import { CompareResults } from '@/components/features/CompareResults';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Storage } from '@/lib/storage';
import { AlertCircle, Scale } from 'lucide-react';

export default function ComparePage() {
  const {
    docAText,
    docBText,
    isComparing,
    error,
    results,
    setDocAText,
    setDocBText,
    setIsComparing,
    setError,
    setResults,
  } = useCompareStore();

  const handleCompare = async () => {
    if (docAText.trim().length < 50 || docBText.trim().length < 50) {
      setError('Both Document A and Document B must contain at least 50 characters.');
      return;
    }

    setIsComparing(true);
    setError(null);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentAText: docAText,
          documentBText: docBText,
          userId: Storage.getUserId(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to compare documents.');
      }

      setResults(data);

      Storage.addToHistory({
        mode: 'compare',
        documentType: `Comparison (${data.docAType} vs ${data.docBType})`,
        riskScore: data.docBRiskScore,
        summary: data.overallVerdict,
      });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Comparison failed.';
      setError(msg);
    } finally {
      setIsComparing(false);
    }
  };

  const isFormValid = docAText.trim().length >= 50 && docBText.trim().length >= 50;

  return (
    <ErrorBoundary>
      <div className="space-y-8 py-4">
        {/* Header */}
        {!results && !isComparing && (
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold font-serif-legal text-text-primary">
              Side-by-Side Contract Comparison
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Upload two versions of a legal agreement. See what changed, what was added or removed, and which version protects your rights.
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

        {/* State Machine */}
        {isComparing ? (
          <LoadingAnalysis />
        ) : results ? (
          <CompareResults data={results} />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document A Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-bold text-text-primary">Document A (Original / Version 1)</h3>
                  <span className="text-xs text-text-muted">{docAText.length} chars</span>
                </div>
                <DocumentUpload
                  onDocumentSubmit={(text) => setDocAText(text)}
                  buttonLabel="Save Document A"
                />
              </div>

              {/* Document B Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-bold text-text-primary">Document B (Updated / Version 2)</h3>
                  <span className="text-xs text-text-muted">{docBText.length} chars</span>
                </div>
                <DocumentUpload
                  onDocumentSubmit={(text) => setDocBText(text)}
                  buttonLabel="Save Document B"
                />
              </div>
            </div>

            {/* Main Action Bar */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleCompare}
                disabled={!isFormValid || isComparing}
                className={`px-8 py-4 rounded-xl text-base font-bold flex items-center gap-3 transition-all shadow-xl ${
                  isFormValid && !isComparing
                    ? 'bg-warning hover:bg-warning/90 text-white shadow-warning/20 cursor-pointer scale-105'
                    : 'bg-border text-text-muted cursor-not-allowed opacity-60'
                }`}
              >
                <Scale className="w-5 h-5" />
                <span>Compare Both Documents</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
