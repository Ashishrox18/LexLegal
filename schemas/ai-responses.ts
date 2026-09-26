import { z } from 'zod';

// ─── Helpers ───────────────────────────────────────────────────────

const coerceFlag = z.preprocess((val) => {
  if (typeof val === 'string') {
    const s = val.toLowerCase().trim();
    if (s === 'red' || s === 'yellow' || s === 'green') return s;
    if (s.includes('red')) return 'red';
    if (s.includes('yellow') || s.includes('amber')) return 'yellow';
    if (s.includes('green')) return 'green';
  }
  return val;
}, z.enum(['red', 'yellow', 'green']));

const coerceDocType = z.preprocess((val) => {
  if (typeof val === 'string') {
    const s = val.toLowerCase().replace(/[\s-]/g, '_');
    const valid = [
      'rental_agreement', 'employment_contract', 'nda',
      'service_agreement', 'loan_agreement', 'legal_notice',
      'sale_deed', 'power_of_attorney', 'partnership_deed', 'other'
    ];
    if (valid.includes(s)) return s;
    if (s.includes('rental') || s.includes('lease')) return 'rental_agreement';
    if (s.includes('employment') || s.includes('job') || s.includes('offer')) return 'employment_contract';
    if (s.includes('nda') || s.includes('confidential')) return 'nda';
    if (s.includes('service')) return 'service_agreement';
    if (s.includes('loan')) return 'loan_agreement';
    if (s.includes('notice')) return 'legal_notice';
    if (s.includes('sale') || s.includes('deed')) return 'sale_deed';
    if (s.includes('power_of_attorney') || s.includes('poa')) return 'power_of_attorney';
    if (s.includes('partnership')) return 'partnership_deed';
  }
  return val;
}, z.enum([
  'rental_agreement', 'employment_contract', 'nda',
  'service_agreement', 'loan_agreement', 'legal_notice',
  'sale_deed', 'power_of_attorney', 'partnership_deed', 'other'
]));

const coerceRiskLevel = z.preprocess((val) => {
  if (typeof val === 'string') {
    const s = val.toLowerCase();
    if (s === 'low' || s === 'moderate' || s === 'high' || s === 'critical') return s;
    if (s.includes('low')) return 'low';
    if (s.includes('mod')) return 'moderate';
    if (s.includes('high')) return 'high';
    if (s.includes('crit')) return 'critical';
  }
  return val;
}, z.enum(['low', 'moderate', 'high', 'critical']));

const coerceCategory = z.preprocess((val) => {
  if (typeof val === 'string') {
    const s = val.toLowerCase().trim();
    const valid = [
      'payment', 'termination', 'liability', 'ip', 'confidentiality',
      'dispute', 'notice', 'renewal', 'deposit', 'obligations', 'other'
    ];
    if (valid.includes(s)) return s;
    if (s.includes('rent') || s.includes('money') || s.includes('fee')) return 'payment';
    if (s.includes('exit') || s.includes('cancel')) return 'termination';
    if (s.includes('damage') || s.includes('indemni')) return 'liability';
  }
  return 'other';
}, z.enum([
  'payment', 'termination', 'liability', 'ip', 'confidentiality',
  'dispute', 'notice', 'renewal', 'deposit', 'obligations', 'other'
]));

const coerceConfidence = z.preprocess((val) => {
  if (typeof val === 'number') {
    if (val >= 0 && val <= 1) return val;
    if (val >= 2 && val <= 100) return val / 100;
  }
  if (typeof val === 'string') {
    const num = parseFloat(val.replace('%', ''));
    if (!isNaN(num)) {
      if (num >= 0 && num <= 1) return num;
      if (num >= 2 && num <= 100) return num / 100;
    }
  }
  return val;
}, z.number().min(0).max(1));

const coerceNullableString = z.preprocess((val) => {
  if (val === null || val === undefined || val === '') return null;
  return String(val);
}, z.string().nullable());

// ─── Shared Schemas ────────────────────────────────────────────────

export const FlagType = coerceFlag;
export type FlagType = z.infer<typeof FlagType>;

export const ClauseSchema = z.object({
  id: z.string().default(() => `clause_${Math.random().toString(36).substr(2, 9)}`),
  title: z.string(),
  originalText: z.string(),
  plainEnglish: z.string(),
  eli5: z.string(),
  flag: coerceFlag,
  reason: z.string(),
  lawCited: coerceNullableString,
  actionable: coerceNullableString,
  category: coerceCategory,
});
export type Clause = z.infer<typeof ClauseSchema>;

export const KeyDateSchema = z.object({
  label: z.string(),
  date: coerceNullableString,
  importance: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.toLowerCase();
      if (s === 'high' || s === 'medium' || s === 'low') return s;
      if (s.includes('high')) return 'high';
      if (s.includes('med')) return 'medium';
      if (s.includes('low')) return 'low';
    }
    return val;
  }, z.enum(['high', 'medium', 'low'])),
  note: coerceNullableString,
});
export type KeyDate = z.infer<typeof KeyDateSchema>;

// ─── Decode Response ───────────────────────────────────────────────

export const DecodeResponseSchema = z.object({
  documentType: coerceDocType,
  jurisdiction: z.string().default('India'),
  partiesInvolved: z.array(z.string()).default([]),
  riskScore: z.coerce.number().int().min(0).max(100).default(50),
  riskLevel: coerceRiskLevel,
  summary: z.string(),
  eli5Summary: z.string(),
  keyDates: z.array(KeyDateSchema).default([]),
  clauses: z.array(ClauseSchema).default([]),
  redFlags: z.array(z.string()).default([]),
  yellowFlags: z.array(z.string()).default([]),
  greenFlags: z.array(z.string()).default([]),
  missingClauses: z.array(z.string()).default([]),
  overallRecommendation: z.string(),
  confidence: coerceConfidence,
});

export type DecodeResponse = z.infer<typeof DecodeResponseSchema>;

// ─── Compare Response ──────────────────────────────────────────────

export const CompareChangeSchema = z.object({
  clauseTitle: z.string(),
  docAText: coerceNullableString,
  docBText: coerceNullableString,
  changeType: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.toLowerCase();
      if (s === 'added' || s === 'removed' || s === 'modified' || s === 'unchanged') return s;
      if (s.includes('add')) return 'added';
      if (s.includes('remove') || s.includes('delete')) return 'removed';
      if (s.includes('mod') || s.includes('change')) return 'modified';
      if (s.includes('same') || s.includes('unchange')) return 'unchanged';
    }
    return val;
  }, z.enum(['added', 'removed', 'modified', 'unchanged'])),
  impact: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.toLowerCase();
      if (s === 'positive' || s === 'negative' || s === 'neutral') return s;
      if (s.includes('pos') || s.includes('good') || s.includes('better')) return 'positive';
      if (s.includes('neg') || s.includes('bad') || s.includes('worse')) return 'negative';
      if (s.includes('neu') || s.includes('same')) return 'neutral';
    }
    return val;
  }, z.enum(['positive', 'negative', 'neutral'])),
  explanation: z.string(),
  flag: coerceFlag,
});
export type CompareChange = z.infer<typeof CompareChangeSchema>;

export const CompareResponseSchema = z.object({
  docAType: z.string().default('Document A'),
  docBType: z.string().default('Document B'),
  overallVerdict: z.string(),
  riskDelta: z.coerce.number().int().min(-100).max(100).default(0),
  docARiskScore: z.coerce.number().int().min(0).max(100).default(50),
  docBRiskScore: z.coerce.number().int().min(0).max(100).default(50),
  favorableVersion: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.toUpperCase().trim();
      if (s === 'A' || s === 'B' || s === 'EQUAL') return s.toLowerCase() === 'equal' ? 'equal' : s;
      if (s.includes('A')) return 'A';
      if (s.includes('B')) return 'B';
    }
    return val;
  }, z.enum(['A', 'B', 'equal'])),
  changes: z.array(CompareChangeSchema).default([]),
  addedClauses: z.array(z.string()).default([]),
  removedClauses: z.array(z.string()).default([]),
  keyDifferences: z.array(z.string()).default([]),
  recommendation: z.string(),
  confidence: coerceConfidence,
});

export type CompareResponse = z.infer<typeof CompareResponseSchema>;

// ─── Prepare Response ──────────────────────────────────────────────

export const NextStepSchema = z.object({
  option: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.toLowerCase();
      if (s === 'diy' || s === 'lawyer' || s === 'ignore' || s === 'negotiate') return s;
      if (s.includes('diy') || s.includes('self')) return 'diy';
      if (s.includes('lawyer') || s.includes('attorney') || s.includes('counsel')) return 'lawyer';
      if (s.includes('negotiat')) return 'negotiate';
      if (s.includes('ignore') || s.includes('drop')) return 'ignore';
    }
    return val;
  }, z.enum(['diy', 'lawyer', 'ignore', 'negotiate'])),
  action: z.string(),
  riskLevel: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.toLowerCase();
      if (s === 'low' || s === 'medium' || s === 'high') return s;
      if (s.includes('high')) return 'high';
      if (s.includes('med')) return 'medium';
      if (s.includes('low')) return 'low';
    }
    return val;
  }, z.enum(['low', 'medium', 'high'])),
  estimatedCost: coerceNullableString,
  timeframe: coerceNullableString,
});
export type NextStep = z.infer<typeof NextStepSchema>;

export const ChecklistItemSchema = z.object({
  id: z.string().default(() => `item_${Math.random().toString(36).substr(2, 9)}`),
  task: z.string(),
  priority: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.toLowerCase();
      if (s === 'high' || s === 'medium' || s === 'low') return s;
      if (s.includes('high')) return 'high';
      if (s.includes('med')) return 'medium';
      if (s.includes('low')) return 'low';
    }
    return val;
  }, z.enum(['high', 'medium', 'low'])),
  done: z.boolean().default(false),
  note: coerceNullableString,
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const PrepareResponseSchema = z.object({
  situationSummary: z.string(),
  urgencyLevel: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.toLowerCase();
      if (s === 'immediate' || s === 'urgent' || s === 'moderate' || s === 'low') return s;
      if (s.includes('immed') || s.includes('critical')) return 'immediate';
      if (s.includes('urg')) return 'urgent';
      if (s.includes('mod')) return 'moderate';
      if (s.includes('low')) return 'low';
    }
    return val;
  }, z.enum(['immediate', 'urgent', 'moderate', 'low'])),
  actWithinDays: z.coerce.number().int().min(0).max(365).nullable().optional().default(30),
  yourRights: z.array(z.string()).default([]),
  questionsForLawyer: z.array(z.string()).default([]),
  nextSteps: z.array(NextStepSchema).default([]),
  checklistItems: z.array(ChecklistItemSchema).default([]),
  redLinesDoNotSign: z.array(z.string()).default([]),
  negotiationPoints: z.array(z.string()).default([]),
  relevantLaws: z.array(z.object({
    name: z.string(),
    relevance: z.string(),
  })).default([]),
});

export type PrepareResponse = z.infer<typeof PrepareResponseSchema>;

// ─── Ask/Q&A Response ─────────────────────────────────────────────

export const AskResponseSchema = z.object({
  answer: z.string(),
  confidence: coerceConfidence,
  relevantClauses: z.array(z.string()).default([]),
  caveat: coerceNullableString,
  suggestedFollowUps: z.array(z.string()).default([]),
});

export type AskResponse = z.infer<typeof AskResponseSchema>;

// ─── Storage Schemas ───────────────────────────────────────────────

export const HistoryItemSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  mode: z.enum(['decode', 'compare', 'prepare']),
  documentType: z.string(),
  riskScore: z.number().int().min(0).max(100).nullable(),
  summary: z.string(),
});
export type HistoryItem = z.infer<typeof HistoryItemSchema>;

export const StorageSchema = z.object({
  version: z.string(),
  userId: z.string().uuid(),
  history: z.array(HistoryItemSchema).default([]),
});
export type StorageData = z.infer<typeof StorageSchema>;

// ─── API Request Schemas ───────────────────────────────────────────

export const DecodeRequestSchema = z.object({
  documentText: z.string().min(50).max(50000),
  userId: z.string().uuid(),
});
export type DecodeRequest = z.infer<typeof DecodeRequestSchema>;

export const CompareRequestSchema = z.object({
  documentAText: z.string().min(50).max(50000),
  documentBText: z.string().min(50).max(50000),
  userId: z.string().uuid(),
});
export type CompareRequest = z.infer<typeof CompareRequestSchema>;

export const PrepareRequestSchema = z.object({
  analysisJson: z.unknown(), // Allow any analysis JSON, will extract summary/risk
  documentText: z.string().min(50).max(50000),
  userId: z.string().uuid(),
});
export type PrepareRequest = z.infer<typeof PrepareRequestSchema>;

export const AskRequestSchema = z.object({
  question: z.string().min(5).max(500),
  documentText: z.string().min(50).max(50000),
  userId: z.string().uuid(),
});
export type AskRequest = z.infer<typeof AskRequestSchema>;

export const ParsePdfRequestSchema = z.object({
  userId: z.string().uuid(),
});
export type ParsePdfRequest = z.infer<typeof ParsePdfRequestSchema>;
