/**
 * @module riskScorer
 * Re-exports risk scoring utilities from legalContext for convenient, focused imports.
 *
 * @example
 * ```ts
 * import { computeRiskScore, getRiskLevel } from '@/lib/riskScorer';
 * const score = computeRiskScore(3, 2, 1); // → 55
 * const level = getRiskLevel(score);        // → 'moderate'
 * ```
 */
export { computeRiskScore, getRiskLevel } from './legalContext';
