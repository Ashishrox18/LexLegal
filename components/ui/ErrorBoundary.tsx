'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('LexAI ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="w-full max-w-xl mx-auto my-12 p-6 bg-card border border-danger/40 rounded-xl shadow-xl text-center"
        >
          <div className="w-12 h-12 rounded-full bg-danger-muted text-danger mx-auto flex items-center justify-center mb-4">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif-legal text-text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-xs text-text-secondary mb-6">
            {this.state.error?.message || 'An unexpected rendering error occurred. LexAI caught this gracefully.'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium text-xs rounded-lg transition-colors shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
