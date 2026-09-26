'use client';

import React, { useState } from 'react';
import { Clause } from '@/schemas/ai-responses';
import { FlagBadge } from './FlagBadge';
import { ChevronDown, ChevronUp, Scale, Lightbulb, Sparkles } from 'lucide-react';

interface ClauseCardProps {
  clause: Clause;
}

export const ClauseCard: React.FC<ClauseCardProps> = ({ clause }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEli5, setShowEli5] = useState(false);

  const flagMap = {
    red: 'clause-red',
    yellow: 'clause-yellow',
    green: 'clause-green',
  };

  const borderClass = flagMap[clause.flag] || 'clause-yellow';

  return (
    <div
      className={`bg-card rounded-lg p-5 border border-border shadow-sm transition-all hover:border-border/80 ${borderClass}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-semibold text-text-primary tracking-wide">
            {clause.title || 'Legal Clause'}
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-surface text-text-muted border border-border-subtle capitalize">
            {clause.category || 'general'}
          </span>
        </div>
        <FlagBadge flag={clause.flag || 'yellow'} size="sm" />
      </div>

      {/* Main explanation (Plain English or ELI5 toggle) */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            {showEli5 ? 'ELI5 Explanation (Simplest)' : 'Plain English Summary'}
          </span>
          <button
            onClick={() => setShowEli5(!showEli5)}
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-medium transition-colors"
            aria-label={showEli5 ? 'Switch to Plain English' : 'Switch to ELI5 mode'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showEli5 ? 'Show Detailed' : 'Explain Like I\'m 5'}
          </button>
        </div>
        <p className="text-sm text-text-primary leading-relaxed bg-surface/60 p-3 rounded-md border border-border-subtle">
          {showEli5 ? (clause.eli5 || clause.plainEnglish) : (clause.plainEnglish || clause.eli5)}
        </p>
      </div>

      {/* Reason / Flag Justification */}
      {clause.reason && (
        <div className="mb-3 text-xs text-text-secondary">
          <strong className="text-text-primary font-medium">Why flagged: </strong>
          {clause.reason}
        </div>
      )}

      {/* Law cited & Actionable tip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3">
        {clause.lawCited && (
          <div className="flex items-start gap-1.5 bg-surface/80 p-2.5 rounded border border-border-subtle text-text-secondary">
            <Scale className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-text-primary block">Relevant Indian Law:</span>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(clause.lawCited + ' India law')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary-hover transition-colors"
              >
                {clause.lawCited}
              </a>
            </div>
          </div>
        )}

        {clause.actionable && (
          <div className="flex items-start gap-1.5 bg-surface/80 p-2.5 rounded border border-border-subtle text-text-secondary">
            <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-text-primary block">What to do:</span>
              <span>{clause.actionable}</span>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Original Text */}
      {clause.originalText && (
        <div className="pt-2 border-t border-border-subtle">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="w-full flex items-center justify-between text-xs text-text-muted hover:text-text-secondary font-medium transition-colors py-1"
          >
            <span>Original Legal Excerpt</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isExpanded && (
            <blockquote className="mt-2 p-3 bg-base rounded text-xs font-mono text-text-muted border-l-2 border-border overflow-x-auto leading-relaxed">
              "{clause.originalText}"
            </blockquote>
          )}
        </div>
      )}
    </div>
  );
};
