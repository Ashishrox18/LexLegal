/**
 * @module sanitize
 * Sanitization utilities for user-submitted content before processing by AI models.
 * All functions are pure and have no side effects.
 */

/** Maximum characters accepted from a legal document. ~50k chars ≈ 12k tokens. */
const MAX_DOCUMENT_CHARS = 50_000;

/** Maximum characters accepted from a user question. */
const MAX_QUESTION_CHARS = 500;

/**
 * Sanitizes a legal document string for safe transmission to the AI model.
 *
 * Removes:
 * - Script tags and inline JavaScript
 * - HTML/XML tags
 * - Null bytes and zero-width characters
 * - Excessive whitespace
 *
 * @param text - Raw user-provided document text
 * @returns Sanitized document text, hard-capped at {@link MAX_DOCUMENT_CHARS}
 */
export function sanitizeDocument(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove scripts
    .replace(/<[^>]*>/g, ' ')    // strip HTML tags
    .replace(/[<>]/g, '')        // remove stray angle brackets
    .replace(/\0/g, '')          // remove null bytes
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width chars
    .replace(/\s{3,}/g, '\n\n') // normalize excessive whitespace
    .trim()
    .slice(0, MAX_DOCUMENT_CHARS);
}

/**
 * Sanitizes a user-submitted question for safe AI processing.
 *
 * Strips HTML, quotes, and excessive whitespace.
 *
 * @param text - Raw user question string
 * @returns Sanitized question string, hard-capped at {@link MAX_QUESTION_CHARS}
 */
export function sanitizeQuestion(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"`]/g, '')   // also strip backticks and quotes
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUESTION_CHARS);
}
