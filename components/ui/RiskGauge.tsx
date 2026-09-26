'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { getRiskLevel } from '@/lib/riskScorer';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 'md' }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldReduceMotion = useReducedMotion();
  const clampedScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const level = getRiskLevel(clampedScore);

  const getColor = (s: number) => {
    if (s <= 25) return '#10B981'; // safe
    if (s <= 50) return '#84CC16'; // yellow-green
    if (s <= 75) return '#F59E0B'; // warning
    return '#EF4444'; // danger
  };

  const currentColor = getColor(clampedScore);

  const sizeMap = {
    sm: { width: 140, height: 90, strokeWidth: 10, fontSize: 'text-2xl', labelSize: 'text-xs' },
    md: { width: 220, height: 130, strokeWidth: 14, fontSize: 'text-4xl', labelSize: 'text-sm' },
    lg: { width: 300, height: 180, strokeWidth: 18, fontSize: 'text-5xl', labelSize: 'text-base' },
  };

  const dimensions = sizeMap[size] || sizeMap.md;

  const radius = (dimensions.width - dimensions.strokeWidth * 2) / 2;
  const circumference = Math.PI * radius; // 180 degree arc length
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div
      className="flex flex-col items-center justify-center select-none"
      role="img"
      aria-label={`Risk score: ${clampedScore} out of 100. Risk level: ${level}`}
    >
      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        <svg
          width={dimensions.width}
          height={dimensions.width / 2 + dimensions.strokeWidth}
          viewBox={`0 0 ${dimensions.width} ${dimensions.width / 2 + dimensions.strokeWidth}`}
          className="overflow-visible"
        >
          {/* Background Track Arc */}
          <path
            d={`M ${dimensions.strokeWidth} ${dimensions.width / 2} A ${radius} ${radius} 0 0 1 ${
              dimensions.width - dimensions.strokeWidth
            } ${dimensions.width / 2}`}
            fill="none"
            stroke="#232330"
            strokeWidth={dimensions.strokeWidth}
            strokeLinecap="round"
          />
          {/* Animated Value Arc */}
          <motion.path
            d={`M ${dimensions.strokeWidth} ${dimensions.width / 2} A ${radius} ${radius} 0 0 1 ${
              dimensions.width - dimensions.strokeWidth
            } ${dimensions.width / 2}`}
            fill="none"
            stroke={currentColor}
            strokeWidth={dimensions.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: mounted ? strokeDashoffset : circumference }}
            transition={{
              duration: shouldReduceMotion ? 0 : 1.2,
              ease: 'easeOut',
            }}
          />
        </svg>

        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className={`font-bold font-serif-legal ${dimensions.fontSize} text-text-primary`}>
            {clampedScore}
          </span>
          <span
            className={`font-semibold capitalize tracking-wider ${dimensions.labelSize}`}
            style={{ color: currentColor }}
          >
            {level} Risk
          </span>
        </div>
      </div>
    </div>
  );
};
