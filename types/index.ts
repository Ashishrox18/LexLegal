import { z } from 'zod';
import {
  FlagType,
  ClauseSchema,
  KeyDateSchema,
  DecodeResponseSchema,
  CompareChangeSchema,
  CompareResponseSchema,
  NextStepSchema,
  ChecklistItemSchema,
  PrepareResponseSchema,
  AskResponseSchema,
  HistoryItemSchema,
  StorageSchema,
  DecodeRequestSchema,
  CompareRequestSchema,
  PrepareRequestSchema,
  AskRequestSchema,
  ParsePdfRequestSchema,
} from '@/schemas/ai-responses';

export type Flag = z.infer<typeof FlagType>;
export type Clause = z.infer<typeof ClauseSchema>;
export type KeyDate = z.infer<typeof KeyDateSchema>;
export type DecodeResponse = z.infer<typeof DecodeResponseSchema>;
export type CompareChange = z.infer<typeof CompareChangeSchema>;
export type CompareResponse = z.infer<typeof CompareResponseSchema>;
export type NextStep = z.infer<typeof NextStepSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type PrepareResponse = z.infer<typeof PrepareResponseSchema>;
export type AskResponse = z.infer<typeof AskResponseSchema>;
export type HistoryItem = z.infer<typeof HistoryItemSchema>;
export type StorageData = z.infer<typeof StorageSchema>;
export type DecodeRequest = z.infer<typeof DecodeRequestSchema>;
export type CompareRequest = z.infer<typeof CompareRequestSchema>;
export type PrepareRequest = z.infer<typeof PrepareRequestSchema>;
export type AskRequest = z.infer<typeof AskRequestSchema>;
export type ParsePdfRequest = z.infer<typeof ParsePdfRequestSchema>;
