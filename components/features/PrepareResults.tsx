'use client';

import React, { useState, useEffect } from 'react';
import { PrepareResponse } from '@/schemas/ai-responses';
import {
  Printer,
  Copy,
  CheckCircle,
  AlertOctagon,
  Clock,
  Scale,
  FileCheck,
  CheckSquare,
  Square,
  HelpCircle,
  Shield,
} from 'lucide-react';

interface PrepareResultsProps {
  data: PrepareResponse;
}

const PrepareResultsInner: React.FC<PrepareResultsProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [checklist, setChecklist] = useState(data?.checklistItems || []);

  const yourRights = data?.yourRights || [];
  const questionsForLawyer = data?.questionsForLawyer || [];
  const nextSteps = data?.nextSteps || [];
  const redLinesDoNotSign = data?.redLinesDoNotSign || [];
  const relevantLaws = data?.relevantLaws || [];

  // Sync checklist state with local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lexai_checklist_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setChecklist((prev) =>
              prev.map((item) => {
                const match = parsed.find((p: { id: string; done: boolean }) => p.id === item.id);
                return match ? { ...item, done: match.done } : item;
              })
            );
          }
        } catch {
          // ignore corrupted local state
        }
      }
    }
  }, []);

  const toggleChecklist = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lexai_checklist_state', JSON.stringify(updated.map((i) => ({ id: i.id, done: i.done }))));
    }
  };

  const completedCount = checklist.filter((i) => i.done).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const handleCopyQuestions = () => {
    const textToCopy = questionsForLawyer
      .map((q, idx) => `${idx + 1}. ${q}`)
      .join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const urgencyStylesMap = {
    immediate: 'bg-danger text-white',
    urgent: 'bg-warning text-white',
    moderate: 'bg-primary text-white',
    low: 'bg-safe text-white',
  };

  const urgencyStyles = urgencyStylesMap[data?.urgencyLevel] || 'bg-primary text-white';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Print Header (Visible only when printing) */}
      <div className="hidden print:block mb-8 pb-4 border-b border-gray-400">
        <h1 className="text-2xl font-bold text-black font-serif-legal">LexAI Legal Preparation Brief</h1>
        <p className="text-xs text-gray-600">Generated on {new Date().toLocaleDateString('en-IN')}</p>
        <p className="text-[10px] text-gray-500 mt-1">
          Disclaimer: Information only, not formal legal advice.
        </p>
      </div>

      {/* Header bar with Print & Copy */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold font-serif-legal text-text-primary">
            Lawyer Preparation Brief & Checklist
          </h2>
          <p className="text-xs text-text-muted">
            Everything you need before consulting a lawyer or taking action yourself.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyQuestions}
            className="px-4 py-2 bg-surface hover:bg-border text-text-primary font-medium text-xs rounded-lg transition-colors border border-border-subtle flex items-center gap-1.5"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-safe" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Questions!' : 'Copy Questions'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium text-xs rounded-lg transition-colors shadow flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Brief / PDF</span>
          </button>
        </div>
      </div>

      {/* Section 1: Situation Summary & Urgency */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-border-subtle pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Situation Summary
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${urgencyStyles}`}>
              {data?.urgencyLevel || 'moderate'} Urgency
            </span>
            {data?.actWithinDays !== null && data?.actWithinDays !== undefined && (
              <span className="text-xs bg-surface px-3 py-1 rounded-full border border-border-subtle text-warning font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Act within {data.actWithinDays} days
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-text-primary leading-relaxed bg-surface/60 p-4 rounded-lg border border-border-subtle">
          {data?.situationSummary || 'Preparation brief generated.'}
        </p>
      </div>

      {/* Section 2: Your Rights Under Indian Law */}
      {yourRights.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-bold font-serif-legal text-text-primary flex items-center gap-2">
            <Shield className="w-5 h-5 text-safe" />
            Your Rights Under Indian Law
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {yourRights.map((right, idx) => (
              <div
                key={idx}
                className="bg-surface/80 p-3.5 rounded-lg border border-border-subtle text-xs text-text-secondary flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-safe-muted text-safe font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{right}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Smart Questions for Your Lawyer */}
      {questionsForLawyer.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold font-serif-legal text-text-primary flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Specific Questions to Ask Your Lawyer
            </h3>
            <span className="text-xs text-text-muted hidden sm:block">
              Take these questions to your legal consultation
            </span>
          </div>

          <div className="space-y-2.5">
            {questionsForLawyer.map((q, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-surface border border-border-subtle rounded-lg text-sm text-text-primary flex items-start gap-3"
              >
                <span className="font-bold text-primary flex-shrink-0">{idx + 1}.</span>
                <span className="leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Next Steps Options (DIY / Negotiate / Lawyer) */}
      {nextSteps.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif-legal text-text-primary">
            Recommended Action Pathways
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nextSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-lg space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Option: {step.option}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text-muted capitalize">
                      {step.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    {step.action}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-subtle flex flex-col gap-1 text-[11px] text-text-muted">
                  {step.estimatedCost && (
                    <div className="flex items-center justify-between">
                      <span>Est. Cost:</span>
                      <span className="font-semibold text-text-primary">{step.estimatedCost}</span>
                    </div>
                  )}
                  {step.timeframe && (
                    <div className="flex items-center justify-between">
                      <span>Timeframe:</span>
                      <span className="font-semibold text-text-primary">{step.timeframe}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Interactive Action Checklist */}
      {checklist.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-safe" />
              <h3 className="text-lg font-bold font-serif-legal text-text-primary">
                Action Checklist ({completedCount}/{checklist.length})
              </h3>
            </div>
            <span className="text-xs font-semibold text-safe">{progressPercent}% Completed</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border-subtle">
            <div
              className="h-full bg-safe transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-3.5 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${
                  item.done
                    ? 'bg-surface/40 border-border-subtle opacity-70'
                    : 'bg-surface border-border hover:border-primary/50'
                }`}
              >
                <button
                  type="button"
                  aria-label={`Mark task ${item.task} as ${item.done ? 'incomplete' : 'complete'}`}
                  className="mt-0.5 text-safe"
                >
                  {item.done ? <CheckSquare className="w-5 h-5 text-safe" /> : <Square className="w-5 h-5 text-text-muted" />}
                </button>
                <div className="flex-grow">
                  <span
                    className={`text-sm text-text-primary block ${
                      item.done ? 'line-through text-text-muted' : 'font-medium'
                    }`}
                  >
                    {item.task}
                  </span>
                  {item.note && <span className="text-xs text-text-muted block mt-0.5">{item.note}</span>}
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-card border border-border-subtle text-text-muted">
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 6: Red Lines (Do Not Sign If) */}
      {redLinesDoNotSign.length > 0 && (
        <div className="bg-card border border-danger/40 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-danger">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="text-lg font-bold font-serif-legal">
              Red Lines — Do Not Sign If Present
            </h3>
          </div>
          <div className="space-y-2">
            {redLinesDoNotSign.map((line, idx) => (
              <div
                key={idx}
                className="p-3 bg-danger-muted/30 border border-danger/30 rounded-lg text-xs text-danger font-semibold flex items-start gap-2"
              >
                <span>🔴</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 7: Relevant Laws Reference */}
      {relevantLaws.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-bold font-serif-legal text-text-primary flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Applicable Indian Acts & Statutes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relevantLaws.map((law, idx) => (
              <div key={idx} className="bg-surface p-3.5 rounded-lg border border-border-subtle text-xs">
                <span className="font-bold text-text-primary block mb-1">{law.name}</span>
                <span className="text-text-secondary leading-relaxed">{law.relevance}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const PrepareResults = React.memo(PrepareResultsInner);
