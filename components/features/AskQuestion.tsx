'use client';

import React, { useState } from 'react';
import { AskResponse } from '@/schemas/ai-responses';
import { Storage } from '@/lib/storage';
import { Send, MessageSquare, AlertCircle, HelpCircle, Loader2, Sparkles } from 'lucide-react';

interface AskQuestionProps {
  documentText: string;
}

export const AskQuestion: React.FC<AskQuestionProps> = ({ documentText }) => {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<Array<{ q: string; a: AskResponse }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxQuestions = 5;
  const remainingQuestions = maxQuestions - answers.length;

  const handleAsk = async (qToAsk?: string) => {
    const query = qToAsk || question;
    if (!query || query.trim().length < 5) {
      setError('Please ask a question with at least 5 characters.');
      return;
    }
    if (answers.length >= maxQuestions) {
      setError('Session limit reached (5 questions per document session).');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          documentText,
          userId: Storage.getUserId(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to answer question.');
      }

      setAnswers((prev) => [...prev, { q: query, a: data }]);
      setQuestion('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process question.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 mt-8 shadow-xl">
      <div className="flex items-center justify-between gap-4 mb-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold font-serif-legal text-text-primary">
            Ask LexAI About This Document
          </h3>
        </div>
        <span className="text-xs text-text-muted bg-surface px-2.5 py-1 rounded-full border border-border-subtle">
          {remainingQuestions} questions left
        </span>
      </div>

      {/* Answer History */}
      {answers.length > 0 && (
        <div className="space-y-4 mb-6">
          {answers.map((item, idx) => {
            const relevantClauses = item.a?.relevantClauses || [];
            const suggestedFollowUps = item.a?.suggestedFollowUps || [];

            return (
              <div key={idx} className="bg-surface/80 border border-border-subtle rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <h4 className="text-sm font-semibold text-text-primary">{item.q}</h4>
                </div>

                <div className="pl-6 border-l-2 border-primary/40 space-y-2">
                  <p className="text-sm text-text-secondary leading-relaxed">{item.a?.answer || 'No response.'}</p>

                  {relevantClauses.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                      <span className="font-semibold">Relevant Sections:</span>
                      {relevantClauses.map((c, i) => (
                        <span key={i} className="bg-card px-2 py-0.5 rounded text-primary border border-primary/20">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.a?.caveat && (
                    <p className="text-xs text-warning bg-warning-muted/40 p-2 rounded border border-warning/20">
                      ⚠️ {item.a.caveat}
                    </p>
                  )}

                  {suggestedFollowUps.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-text-muted block mb-1.5">
                        Suggested follow-ups:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {suggestedFollowUps.map((fu, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => handleAsk(fu)}
                            disabled={isLoading || remainingQuestions <= 0}
                            className="text-xs text-primary hover:text-primary-hover bg-primary-muted px-2.5 py-1 rounded-md border border-primary/30 transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            {fu}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Input row */}
      {remainingQuestions > 0 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex flex-col sm:flex-row items-stretch gap-2"
        >
          <div className="relative flex-grow">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Can the landlord increase rent during the term? What is the notice period?"
              aria-label="Ask a question about this document"
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              maxLength={500}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className={`px-5 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              !isLoading && question.trim()
                ? 'bg-primary hover:bg-primary-hover text-white shadow-md'
                : 'bg-border text-text-muted cursor-not-allowed'
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Ask</span>
          </button>
        </form>
      ) : (
        <p className="text-xs text-text-muted text-center py-2">
          You have used all 5 questions for this document session.
        </p>
      )}

      {error && (
        <div role="alert" className="mt-3 p-3 bg-danger-muted border border-danger/30 rounded-lg flex items-center gap-2 text-xs text-danger">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
