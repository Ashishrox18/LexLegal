import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured } from '@/lib/ai/gemini';
import { buildPreparePrompt } from '@/lib/ai/prompts';
import { PrepareRequestSchema, PrepareResponseSchema } from '@/schemas/ai-responses';
import { sanitizeDocument } from '@/lib/sanitize';
import { isRateLimited } from '@/lib/rateLimiter';
import { decodeCache, buildCacheKey } from '@/lib/cache';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysisJson, documentText, userId } = PrepareRequestSchema.parse(body);

    if (isRateLimited(`prepare:${userId}`, 10)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    const sanitizedDoc = sanitizeDocument(documentText);
    const analysisStr = JSON.stringify(analysisJson);

    // Cache keyed on analysis + doc — same inputs always yield same brief
    const cacheKey = buildCacheKey(['prepare', analysisStr.slice(0, 500), sanitizedDoc.slice(0, 500)]);
    const cached = decodeCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    const result = await callGeminiStructured(
      buildPreparePrompt(analysisStr, sanitizedDoc),
      PrepareResponseSchema
    );

    decodeCache.set(cacheKey, result);

    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid preparation request data.' },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'AI service is busy. Please try again in 30 seconds.' },
        { status: 429 }
      );
    }
    console.error('[/api/prepare]', error);
    return NextResponse.json(
      { error: 'Preparation brief generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
