import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured } from '@/lib/ai/gemini';
import { buildAskPrompt } from '@/lib/ai/prompts';
import { AskRequestSchema, AskResponseSchema } from '@/schemas/ai-responses';
import { sanitizeDocument, sanitizeQuestion } from '@/lib/sanitize';
import { isRateLimited } from '@/lib/rateLimiter';
import { askCache, buildCacheKey } from '@/lib/cache';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, documentText, userId } = AskRequestSchema.parse(body);

    if (isRateLimited(`ask:${userId}`, 15)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    const sanitizedQ = sanitizeQuestion(question);
    const sanitizedDoc = sanitizeDocument(documentText);

    // Cache Q&A results — same question on same doc gives same answer
    const cacheKey = buildCacheKey([sanitizedQ, sanitizedDoc]);
    const cached = askCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    const result = await callGeminiStructured(
      buildAskPrompt(sanitizedQ, sanitizedDoc),
      AskResponseSchema
    );

    askCache.set(cacheKey, result);

    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Please enter a valid question (5 to 500 characters).' },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'AI service is busy. Please try again in 30 seconds.' },
        { status: 429 }
      );
    }
    console.error('[/api/ask]', error);
    return NextResponse.json(
      { error: 'Failed to process question. Please try again.' },
      { status: 500 }
    );
  }
}
