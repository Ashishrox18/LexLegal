'use client';

import React from 'react';
import Link from 'next/link';
import { useHistory } from '@/hooks/useHistory';
import { Search, Scale, FileCheck, ArrowRight, ShieldCheck, History, Trash2 } from 'lucide-react';

export default function LandingPage() {
  const { history, clearAllHistory } = useHistory();

  return (
    <div className="space-y-16 py-6 animate-fadeIn">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-muted border border-primary/30 text-primary text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          GenAI-Powered Indian Legal Document Intelligence
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold font-serif-legal text-text-primary tracking-tight leading-tight">
          Understand before you sign.<br />
          <span className="text-primary">Know before you act.</span>
        </h1>

        <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
          LexAI makes legal documents accessible to everyday Indians who cannot afford a lawyer.
          Paste any contract, agreement, or notice — get plain-English explanations, risk flags, and lawyer-ready briefs in seconds.
        </p>
      </section>

      {/* Mode Selection Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Decode */}
        <div className="bg-card border border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-muted text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif-legal font-bold text-text-primary">
              Decode a Document
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Paste or upload any legal document. Get plain-English explanations, risk flags, and key clause analysis instantly.
            </p>
            <div className="pt-2 text-[11px] text-text-muted">
              <strong>Supported:</strong> Rental agreements, employment contracts, NDAs, legal notices, sale deeds & more.
            </div>
          </div>

          <Link
            href="/decode"
            className="mt-6 w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <span>Start Decoding</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Compare */}
        <div className="bg-card border border-border hover:border-warning/50 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-warning-muted text-warning flex items-center justify-center group-hover:scale-110 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif-legal font-bold text-text-primary">
              Compare Two Documents
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Upload two versions of a contract or agreement. See exactly what changed, what was added/removed, and which protects you better.
            </p>
            <div className="pt-2 text-[11px] text-text-muted">
              <strong>Ideal for:</strong> Revised lease agreements, modified job offers, updated terms of service.
            </div>
          </div>

          <Link
            href="/compare"
            className="mt-6 w-full py-3 bg-warning hover:bg-warning/90 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <span>Start Comparing</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Prepare */}
        <div className="bg-card border border-border hover:border-safe/50 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-safe-muted text-safe flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif-legal font-bold text-text-primary">
              Prepare for a Lawyer
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Generate a lawyer-ready brief, your statutory rights checklist under Indian law, and smart questions to ask during consultation.
            </p>
            <div className="pt-2 text-[11px] text-text-muted">
              <strong>Includes:</strong> DIY vs Negotiation path, printable brief, actionable checklist.
            </div>
          </div>

          <Link
            href="/prepare"
            className="mt-6 w-full py-3 bg-safe hover:bg-safe/90 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <span>Start Preparing</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Recent History Section */}
      <section id="history" className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-serif-legal text-text-primary">
              Recent Analyses History
            </h2>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearAllHistory}
              className="text-xs text-text-muted hover:text-danger flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {history.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-surface p-4 rounded-xl border border-border-subtle flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-primary capitalize">
                      {item.documentType.replace(/_/g, ' ')}
                    </span>
                    {item.riskScore !== null && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.riskScore > 50
                            ? 'bg-danger-muted text-danger border-danger/30'
                            : 'bg-safe-muted text-safe border-safe/30'
                        }`}
                      >
                        Risk {item.riskScore}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{item.summary}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border-subtle">
                  <span>{new Date(item.timestamp).toLocaleDateString('en-IN')}</span>
                  <Link
                    href={`/${item.mode}`}
                    className="text-primary hover:text-primary-hover font-medium flex items-center gap-1"
                  >
                    View Mode →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted text-center py-6">
            No document history stored yet. Analyze a document to see your recent reports here.
          </p>
        )}
      </section>
    </div>
  );
}
