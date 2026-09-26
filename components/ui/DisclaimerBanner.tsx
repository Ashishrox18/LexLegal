import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Legal Disclaimer"
      className="w-full bg-surface/90 backdrop-blur border-b border-border text-xs text-text-secondary py-2.5 px-4 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold text-text-primary">Legal Disclaimer:</strong> LexAI provides information, not legal advice. Consult a qualified lawyer for your specific situation.
        </span>
      </div>
    </div>
  );
};
