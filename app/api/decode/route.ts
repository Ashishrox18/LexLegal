import { NextResponse } from 'next/server';
import { callGeminiStructured } from '@/lib/ai/gemini';
import { buildDecodePrompt } from '@/lib/ai/prompts';
import { DecodeRequestSchema, DecodeResponseSchema } from '@/schemas/ai-responses';
import { sanitizeDocument } from '@/lib/sanitize';
import { isRateLimited } from '@/lib/rateLimiter';
import { decodeCache, buildCacheKey } from '@/lib/cache';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const parseResult = DecodeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Please provide a valid document (minimum 50 characters).' },
        { status: 400 }
      );
    }
    const { documentText, userId } = parseResult.data;

    if (isRateLimited(`decode:${userId}`, 10)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    // Sanitize before sending to AI
    const sanitized = sanitizeDocument(documentText);

    // Check cache first — avoid redundant LLM calls for same document
    const cacheKey = buildCacheKey([sanitized]);
    const cached = decodeCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // Call Groq AI with structured output validation
    const result = await callGeminiStructured(
      buildDecodePrompt(sanitized),
      DecodeResponseSchema
    );

    // Store in cache for subsequent identical requests
    decodeCache.set(cacheKey, result);

    return NextResponse.json(result, {
      headers: { 'X-Cache': 'MISS' },
    });

  } catch (error) {
    if (error instanceof ZodError) {
      console.error('[/api/decode Zod Error]:', error.issues);
      return NextResponse.json(
        { error: 'Analysis produced unexpected results. Please try again.' },
        { status: 422 }
      );
    }
    if (error instanceof Error && error.message === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'AI service is busy. Please try again in 30 seconds.' },
        { status: 429 }
      );
    }
    console.error('[/api/decode]', error);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
