import React from 'react';
import { FlagType } from '@/schemas/ai-responses';

interface FlagBadgeProps {
  flag: FlagType;
  label?: string;
  size?: 'sm' | 'md';
}

export const FlagBadge: React.FC<FlagBadgeProps> = ({ flag, label, size = 'md' }) => {
  const styles = {
    red: 'bg-danger-muted text-danger border-danger/30',
    yellow: 'bg-warning-muted text-warning border-warning/30',
    green: 'bg-safe-muted text-safe border-safe/30',
  };

  const defaultLabels = {
    red: 'Red Flag',
    yellow: 'Yellow Flag',
    green: 'Green Protection',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${styles[flag]} ${sizeClasses}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          flag === 'red' ? 'bg-danger' : flag === 'yellow' ? 'bg-warning' : 'bg-safe'
        }`}
        aria-hidden="true"
      />
      {label || defaultLabels[flag]}
    </span>
  );
};
