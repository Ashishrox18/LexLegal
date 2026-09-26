import { NextResponse } from 'next/server';
import { callGeminiStructured } from '@/lib/ai/gemini';
import { buildComparePrompt } from '@/lib/ai/prompts';
import { CompareRequestSchema, CompareResponseSchema } from '@/schemas/ai-responses';
import { sanitizeDocument } from '@/lib/sanitize';
import { isRateLimited } from '@/lib/rateLimiter';
import { compareCache, buildCacheKey } from '@/lib/cache';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = CompareRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Please provide valid documents (minimum 50 characters each).' },
        { status: 400 }
      );
    }
    const { documentAText, documentBText, userId } = parseResult.data;

    if (isRateLimited(`compare:${userId}`, 10)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    const sanitizedA = sanitizeDocument(documentAText);
    const sanitizedB = sanitizeDocument(documentBText);

    // Cache keyed on both documents — order-insensitive would need sorting,
    // but directional comparison is order-sensitive so key as-is.
    const cacheKey = buildCacheKey([sanitizedA, sanitizedB]);
    const cached = compareCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    const result = await callGeminiStructured(
      buildComparePrompt(sanitizedA, sanitizedB),
      CompareResponseSchema
    );

    compareCache.set(cacheKey, result);

    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Comparison produced unexpected results. Please try again.' },
        { status: 422 }
      );
    }
    if (error instanceof Error && error.message === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'AI service is busy. Please try again in 30 seconds.' },
        { status: 429 }
      );
    }
    console.error('[/api/compare]', error);
    return NextResponse.json(
      { error: 'Comparison failed. Please try again.' },
      { status: 500 }
    );
  }
}
