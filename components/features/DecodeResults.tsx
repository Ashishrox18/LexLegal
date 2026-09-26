'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DecodeResponse } from '@/schemas/ai-responses';
import { RiskGauge } from '../ui/RiskGauge';
import { ClauseCard } from '../ui/ClauseCard';
import { DocumentTypeDetector } from './DocumentTypeDetector';
import { AskQuestion } from './AskQuestion';
import { useDecodeStore } from '@/hooks/useDecodeStore';
import { AlertCircle, Calendar, ArrowRight, RefreshCw, FileText, CheckCircle } from 'lucide-react';

interface DecodeResultsProps {
  data: DecodeResponse;
}

export const DecodeResults: React.FC<DecodeResultsProps> = ({ data }) => {
  const router = useRouter();
  const { documentText, reset } = useDecodeStore();

  const [activeSummaryTab, setActiveSummaryTab] = useState<'plain' | 'eli5'>('plain');
  const [filterFlag, setFilterFlag] = useState<'all' | 'red' | 'yellow' | 'green'>('all');

  const clauses = data?.clauses || [];
  const redFlags = data?.redFlags || [];
  const yellowFlags = data?.yellowFlags || [];
  const greenFlags = data?.greenFlags || [];
  const missingClauses = data?.missingClauses || [];
  const keyDates = data?.keyDates || [];

  const filteredClauses = clauses.filter((clause) => {
    if (filterFlag === 'all') return true;
    return clause.flag === filterFlag;
  });

  const handlePrepareClick = () => {
    router.push('/prepare');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Section: Detector & Gauge Header */}
      <DocumentTypeDetector
        documentType={data?.documentType || 'DOCUMENT'}
        jurisdiction={data?.jurisdiction || 'India'}
        partiesInvolved={data?.partiesInvolved || []}
        confidence={data?.confidence || 0.9}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Gauge Card */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
            Legal Risk Assessment
          </h4>
          <RiskGauge score={data?.riskScore ?? 50} size="lg" />
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-text-muted">Analysis Confidence:</span>
            <span className="text-xs font-semibold text-text-primary">
              {Math.round((data?.confidence || 0.9) * 100)}%
            </span>
          </div>
        </div>

        {/* Executive Summary Card with Tabs */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4 border-b border-border pb-3">
              <h3 className="text-lg font-bold font-serif-legal text-text-primary">
                Executive Summary
              </h3>
              <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border-subtle">
                <button
                  onClick={() => setActiveSummaryTab('plain')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeSummaryTab === 'plain'
                      ? 'bg-primary text-white shadow'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Plain English
                </button>
                <button
                  onClick={() => setActiveSummaryTab('eli5')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeSummaryTab === 'eli5'
                      ? 'bg-primary text-white shadow'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  ELI5 (Simplest)
                </button>
              </div>
            </div>

            <p className="text-sm text-text-primary leading-relaxed bg-surface/50 p-4 rounded-lg border border-border-subtle mb-4">
              {activeSummaryTab === 'plain' ? (data?.summary || 'No summary available.') : (data?.eli5Summary || data?.summary || 'No summary available.')}
            </p>
          </div>

          {/* Recommendation Box */}
          <div className="bg-surface/80 p-4 rounded-lg border-l-4 border-primary border-y border-r border-border-subtle">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              Overall Recommendation
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              {data?.overallRecommendation || 'Review document clauses carefully before signing.'}
            </p>
          </div>
        </div>
      </div>

      {/* Key Dates Section */}
      {keyDates.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold font-serif-legal text-text-primary">
              Key Dates & Deadlines
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {keyDates.map((dateItem, idx) => (
              <div
                key={idx}
                className="min-w-[200px] bg-surface p-4 rounded-lg border border-border-subtle flex-shrink-0 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-text-primary block mb-1">
                    {dateItem.label}
                  </span>
                  <span className="text-sm font-mono text-primary block mb-2">
                    {dateItem.date || 'TBD / Ongoing'}
                  </span>
                </div>
                {dateItem.note && (
                  <span className="text-[11px] text-text-muted block border-t border-border-subtle pt-2">
                    {dateItem.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Clause Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Clauses List (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <h3 className="text-xl font-bold font-serif-legal text-text-primary">
              Clause-by-Clause Analysis ({clauses.length})
            </h3>

            {/* Filter Tabs */}
            <div role="tablist" className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border-subtle">
              <button
                role="tab"
                aria-selected={filterFlag === 'all'}
                onClick={() => setFilterFlag('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterFlag === 'all'
                    ? 'bg-primary text-white shadow'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                All ({clauses.length})
              </button>
              <button
                role="tab"
                aria-selected={filterFlag === 'red'}
                onClick={() => setFilterFlag('red')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterFlag === 'red'
                    ? 'bg-danger text-white shadow'
                    : 'text-text-muted hover:text-danger'
                }`}
              >
                🔴 Red ({redFlags.length})
              </button>
              <button
                role="tab"
                aria-selected={filterFlag === 'yellow'}
                onClick={() => setFilterFlag('yellow')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterFlag === 'yellow'
                    ? 'bg-warning text-white shadow'
                    : 'text-text-muted hover:text-warning'
                }`}
              >
                🟡 Yellow ({yellowFlags.length})
              </button>
              <button
                role="tab"
                aria-selected={filterFlag === 'green'}
                onClick={() => setFilterFlag('green')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterFlag === 'green'
                    ? 'bg-safe text-white shadow'
                    : 'text-text-muted hover:text-safe'
                }`}
              >
                🟢 Green ({greenFlags.length})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredClauses.length > 0 ? (
              filteredClauses.map((clause) => (
                <ClauseCard key={clause.id} clause={clause} />
              ))
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-xl text-text-muted text-sm">
                No clauses match the selected filter.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary (1 Col) */}
        <div className="space-y-6">
          {/* Flag Counters */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
              Flag Breakdown
            </h4>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-danger-muted/40 border border-danger/20">
              <span className="text-xs font-medium text-danger">🔴 Red Flags</span>
              <span className="text-sm font-bold text-danger">{redFlags.length}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-warning-muted/40 border border-warning/20">
              <span className="text-xs font-medium text-warning">🟡 Yellow Flags</span>
              <span className="text-sm font-bold text-warning">{yellowFlags.length}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-safe-muted/40 border border-safe/20">
              <span className="text-xs font-medium text-safe">🟢 Green Protections</span>
              <span className="text-sm font-bold text-safe">{greenFlags.length}</span>
            </div>
          </div>

          {/* Missing Clauses Box */}
          {missingClauses.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3 text-warning">
                <AlertCircle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Missing Clauses
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-text-secondary">
                {missingClauses.map((mc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-warning">•</span>
                    <span>{mc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Ask Question Section */}
      <AskQuestion documentText={documentText} />

      {/* Footer Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-surface hover:bg-border text-text-primary font-medium text-xs rounded-lg transition-colors border border-border-subtle flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Analyze Another Document
        </button>

        <button
          onClick={handlePrepareClick}
          className="px-6 py-3 bg-safe hover:bg-safe/90 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-safe/20 flex items-center gap-2"
        >
          <span>Prepare for a Lawyer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
