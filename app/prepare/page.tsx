'use client';

import React, { useState, useEffect } from 'react';
import { useDecodeStore } from '@/hooks/useDecodeStore';
import { DocumentUpload } from '@/components/ui/DocumentUpload';
import { LoadingAnalysis } from '@/components/ui/LoadingAnalysis';
import { PrepareResults } from '@/components/features/PrepareResults';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PrepareResponse } from '@/schemas/ai-responses';
import { Storage } from '@/lib/storage';
import { AlertCircle, FileCheck } from 'lucide-react';

export default function PreparePage() {
  const { results: decodeResults, documentText: decodeDocText } = useDecodeStore();

  const [prepareData, setPrepareData] = useState<PrepareResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrepareBrief = async (analysisJson: unknown, docText: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisJson,
          documentText: docText,
          userId: Storage.getUserId(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate lawyer brief.');
      }

      setPrepareData(data);

      Storage.addToHistory({
        mode: 'prepare',
        documentType: 'Lawyer Brief & Checklist',
        riskScore: null,
        summary: data.situationSummary,
      });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Brief generation failed.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // If coming from /decode page with active decode state
  useEffect(() => {
    if (decodeResults && decodeDocText && !prepareData && !isLoading) {
      fetchPrepareBrief(decodeResults, decodeDocText);
    }
  }, [decodeResults, decodeDocText, prepareData, isLoading]);

  const handleFreshSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Decode
      const decodeRes = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: text,
          userId: Storage.getUserId(),
        }),
      });

      const decodeData = await decodeRes.json();
      if (!decodeRes.ok) {
        throw new Error(decodeData.error || 'Failed to analyze document.');
      }

      // Step 2: Prepare Brief
      await fetchPrepareBrief(decodeData, text);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Processing failed.';
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-8 py-4">
        {/* Header */}
        {!prepareData && !isLoading && (
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold font-serif-legal text-text-primary">
              Lawyer Preparation Brief & Checklist
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Generate a printable legal brief, statutory rights checklist under Indian law, smart questions to ask your lawyer, and dealbreaker redlines.
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
        {isLoading ? (
          <LoadingAnalysis />
        ) : prepareData ? (
          <PrepareResults data={prepareData} />
        ) : (
          <div className="max-w-3xl mx-auto">
            <DocumentUpload
              onDocumentSubmit={handleFreshSubmit}
              buttonLabel="Generate Lawyer Brief & Checklist"
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
