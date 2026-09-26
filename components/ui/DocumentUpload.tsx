'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, File, AlertCircle, Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  onDocumentSubmit: (text: string) => void;
  isLoading?: boolean;
  buttonLabel?: string;
  minChars?: number;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onDocumentSubmit,
  isLoading = false,
  buttonLabel = 'Analyze Document',
  minChars = 50,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [text, setText] = useState('');
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = text.trim().length;
  const isValid = charCount >= minChars;

  const handlePdfUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a valid PDF file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPdfError('PDF file size must be less than 5MB.');
      return;
    }

    setPdfError(null);
    setIsParsingPdf(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract text from PDF.');
      }

      setText(data.text);
      setActiveTab('paste');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'PDF parsing failed.';
      setPdfError(message);
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        handlePdfUpload(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setText(event.target.result as string);
            setActiveTab('paste');
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const handleChipClick = (hintText: string) => {
    setText((prev) => (prev ? `${prev}\n\n[Context: ${hintText}]` : `[Document Type: ${hintText}]\n\n`));
  };

  return (
    <div className="gradient-border-card w-full shadow-2xl">
      <div className="bg-card rounded-[14px] p-6 border border-border">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between gap-4 mb-5 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'paste'
                  ? 'bg-primary text-white shadow'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface'
              }`}
            >
              <FileText className="w-4 h-4" />
              Paste Text
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'upload'
                  ? 'bg-primary text-white shadow'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload PDF
            </button>
          </div>

          <span className="text-xs text-text-muted hidden sm:block">
            Supports: PDF, TXT, Legal Contracts
          </span>
        </div>

        {/* Tab 1: Paste Text */}
        {activeTab === 'paste' ? (
          <div>
            <label htmlFor="document-text-input" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Legal Document Content
            </label>
            <textarea
              id="document-text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your rental agreement, employment contract, NDA, or legal notice here..."
              rows={10}
              className="w-full bg-surface border border-border rounded-lg p-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-y font-mono"
            />
          </div>
        ) : (
          /* Tab 2: Drag & Drop Upload Zone */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer bg-surface/40 hover:bg-surface/80 transition-colors group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
              accept="application/pdf,.txt"
              className="hidden"
              aria-label="Upload PDF document"
            />
            {isParsingPdf ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-text-secondary font-medium">Extracting text from PDF...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary-muted flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4">
                  <File className="w-8 h-8" />
                </div>
                <h4 className="text-base font-semibold text-text-primary mb-1">
                  Drag & drop your legal PDF here
                </h4>
                <p className="text-xs text-text-muted max-w-sm mb-4">
                  Or click to browse files (PDF up to 5MB)
                </p>
                <span className="px-4 py-2 text-xs font-medium bg-surface text-primary border border-primary/30 rounded-lg">
                  Browse Files
                </span>
              </>
            )}
          </div>
        )}

        {pdfError && (
          <div role="alert" className="mt-3 p-3 bg-danger-muted border border-danger/30 rounded-lg flex items-center gap-2 text-xs text-danger">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{pdfError}</span>
          </div>
        )}

        {/* Quick Hint Chips */}
        <div className="mt-4 pt-3 border-t border-border-subtle flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted font-medium">Quick hints:</span>
          {[
            'Rental Agreement',
            'Employment Contract',
            'NDA',
            'Legal Notice',
            'Loan Agreement',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              type="button"
              className="text-xs px-2.5 py-1 rounded-md bg-surface hover:bg-border text-text-secondary hover:text-text-primary border border-border-subtle transition-colors"
            >
              + {chip}
            </button>
          ))}
        </div>

        {/* Bottom Action Row */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-text-muted">
            <span className={isValid ? 'text-safe font-semibold' : 'text-text-muted'}>
              {charCount}
            </span>{' '}
            / {minChars} characters min
          </div>

          <button
            onClick={() => onDocumentSubmit(text)}
            disabled={!isValid || isLoading || isParsingPdf}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
              isValid && !isLoading && !isParsingPdf
                ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 cursor-pointer'
                : 'bg-border text-text-muted cursor-not-allowed opacity-60'
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Processing...' : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
