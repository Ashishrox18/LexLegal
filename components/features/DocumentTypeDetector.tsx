import React from 'react';
import { FileText, MapPin, Users, CheckCircle2 } from 'lucide-react';

interface DocumentTypeDetectorProps {
  documentType: string;
  jurisdiction: string;
  partiesInvolved: string[];
  confidence: number;
}

export const DocumentTypeDetector: React.FC<DocumentTypeDetectorProps> = ({
  documentType,
  jurisdiction,
  partiesInvolved = [],
  confidence = 0.9,
}) => {
  const safeDocType = documentType ? String(documentType) : 'DOCUMENT';
  const formattedDocType = safeDocType.replace(/_/g, ' ').toUpperCase();
  const safeParties = Array.isArray(partiesInvolved) ? partiesInvolved : [];

  return (
    <div className="bg-surface/80 border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-muted text-primary flex items-center justify-center">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
            Detected Document Type
          </span>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            {formattedDocType}
            <span className="text-xs font-normal text-safe flex items-center gap-1 bg-safe-muted px-2 py-0.5 rounded-full border border-safe/20">
              <CheckCircle2 className="w-3 h-3" />
              {Math.round((confidence || 0.9) * 100)}% match
            </span>
          </h3>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-lg border border-border-subtle">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>{jurisdiction || 'India'}</span>
        </div>

        {safeParties.length > 0 && (
          <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-lg border border-border-subtle">
            <Users className="w-3.5 h-3.5 text-warning" />
            <span>{safeParties.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
