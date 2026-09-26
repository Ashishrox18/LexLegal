'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const LoadingAnalysis: React.FC = () => {
  const steps = [
    'Reading document & parsing text...',
    'Identifying clauses & obligations...',
    'Cross-referencing Indian Acts & laws...',
    'Computing risk scores & identifying red flags...',
    'Generating plain-English explanations...',
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="w-full max-w-4xl mx-auto p-8 bg-card border border-border rounded-xl shadow-2xl flex flex-col items-center justify-center text-center my-8"
    >
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-primary-muted flex items-center justify-center text-primary">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <Loader2 className="w-24 h-24 text-primary animate-spin absolute -top-2 -left-2 opacity-80" />
      </div>

      <h3 className="text-xl font-serif-legal font-bold text-text-primary mb-2">
        LexAI Legal Intelligence Engine
      </h3>

      <motion.p
        key={currentStep}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-sm font-medium text-primary mb-6"
      >
        {steps[currentStep]}
      </motion.p>

      {/* Skeleton cards */}
      <div className="w-full space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full h-24 bg-surface/60 rounded-lg p-4 animate-pulse border border-border-subtle flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 bg-border rounded w-1/3" />
              <div className="h-4 bg-border rounded w-16" />
            </div>
            <div className="h-3 bg-border rounded w-5/6" />
            <div className="h-3 bg-border rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
};
