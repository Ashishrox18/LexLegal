'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CompareResponse } from '@/schemas/ai-responses';
import { RiskGauge } from '../ui/RiskGauge';
import { FlagBadge } from '../ui/FlagBadge';
import { useCompareStore } from '@/hooks/useCompareStore';
import { Scale, ArrowRightLeft, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

interface CompareResultsProps {
  data: CompareResponse;
}

export const CompareResults: React.FC<CompareResultsProps> = ({ data }) => {
  const router = useRouter();
  const { reset } = useCompareStore();

  const isBBetter = data?.favorableVersion === 'B';
  const isABetter = data?.favorableVersion === 'A';
  const keyDifferences = data?.keyDifferences || [];
  const changes = data?.changes || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Verdict Banner */}
      <div
        className={`p-6 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
          isBBetter
            ? 'bg-safe-muted/30 border-safe/40 text-safe'
            : isABetter
            ? 'bg-warning-muted/30 border-warning/40 text-warning'
            : 'bg-primary-muted/30 border-primary/40 text-primary'
        }`}
      >
        <div className="flex items-center gap-3">
          <Scale className="w-8 h-8 flex-shrink-0" />
          <div>
            <span className="text-xs uppercase font-bold tracking-wider opacity-80">
              Comparison Verdict
            </span>
            <h3 className="text-xl font-bold font-serif-legal text-text-primary">
              {data?.overallVerdict || 'Comparison completed.'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border text-xs font-semibold text-text-primary">
          <span>Risk Delta:</span>
          <span className={(data?.riskDelta || 0) > 0 ? 'text-danger' : 'text-safe'}>
            {(data?.riskDelta || 0) > 0 ? `+${data?.riskDelta} (B Riskier)` : `${data?.riskDelta || 0} (A Riskier)`}
          </span>
        </div>
      </div>

      {/* Side by Side Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
            Document A ({data?.docAType || 'Document A'})
          </span>
          <RiskGauge score={data?.docARiskScore ?? 50} size="md" />
        </div>

        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
            Document B ({data?.docBType || 'Document B'})
          </span>
          <RiskGauge score={data?.docBRiskScore ?? 50} size="md" />
        </div>
      </div>

      {/* Key Differences List */}
      {keyDifferences.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold font-serif-legal text-text-primary mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Top Key Differences
          </h3>
          <ol className="space-y-3">
            {keyDifferences.map((diff, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-text-secondary bg-surface p-3 rounded-lg border border-border-subtle">
                <span className="font-bold text-primary flex-shrink-0">{idx + 1}.</span>
                <span>{diff}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Changes Table */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-4">
        <h3 className="text-lg font-bold font-serif-legal text-text-primary">
          Detailed Clause Comparison ({changes.length} changes)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Clause</th>
                <th className="py-3 px-4">Document A</th>
                <th className="py-3 px-4">Document B</th>
                <th className="py-3 px-4">Explanation & Impact</th>
                <th className="py-3 px-4">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {changes.length > 0 ? (
                changes.map((change, idx) => {
                  const impactBg =
                    change.impact === 'positive'
                      ? 'bg-safe-muted/20'
                      : change.impact === 'negative'
                      ? 'bg-danger-muted/20'
                      : 'bg-surface/50';

                  return (
                    <tr key={idx} className={`hover:bg-surface/80 transition-colors ${impactBg}`}>
                      <td className="py-3.5 px-4 font-semibold text-text-primary">
                        {change.clauseTitle}
                      </td>
                      <td className="py-3.5 px-4 text-text-muted font-mono max-w-[200px] truncate">
                        {change.docAText || '— (Absent)'}
                      </td>
                      <td className="py-3.5 px-4 text-text-muted font-mono max-w-[200px] truncate">
                        {change.docBText || '— (Absent)'}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary max-w-[300px]">
                        {change.explanation}
                      </td>
                      <td className="py-3.5 px-4">
                        <FlagBadge flag={change.flag || 'yellow'} size="sm" />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    No explicit clause differences detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation & Actions */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-4">
        <h3 className="text-lg font-bold font-serif-legal text-text-primary flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Negotiation Recommendation
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed bg-surface p-4 rounded-lg border border-border-subtle">
          {data?.recommendation || 'Review both document versions carefully.'}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-surface hover:bg-border text-text-primary font-medium text-xs rounded-lg transition-colors border border-border-subtle flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Compare Other Documents
          </button>

          <button
            onClick={() => router.push('/prepare')}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-all shadow-lg flex items-center gap-2"
          >
            <span>Prepare Negotiation Brief</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
