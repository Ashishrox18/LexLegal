import { NextResponse } from 'next/server';
import { callGeminiStructured } from '@/lib/ai/gemini';
import { buildComparePrompt } from '@/lib/ai/prompts';
import { CompareRequestSchema, CompareResponseSchema } from '@/schemas/ai-responses';
import { sanitizeDocument } from '@/lib/sanitize';
import { ZodError } from 'zod';

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

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

    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    const sanitizedA = sanitizeDocument(documentAText);
    const sanitizedB = sanitizeDocument(documentBText);

    const result = await callGeminiStructured(
      buildComparePrompt(sanitizedA, sanitizedB),
      CompareResponseSchema
    );

    return NextResponse.json(result);

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
