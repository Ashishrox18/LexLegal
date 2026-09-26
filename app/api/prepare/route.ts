import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured } from '@/lib/ai/gemini';
import { buildPreparePrompt } from '@/lib/ai/prompts';
import { PrepareRequestSchema, PrepareResponseSchema } from '@/schemas/ai-responses';
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysisJson, documentText, userId } = PrepareRequestSchema.parse(body);

    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    const sanitizedDoc = sanitizeDocument(documentText);
    const analysisStr = JSON.stringify(analysisJson);

    const result = await callGeminiStructured(
      buildPreparePrompt(analysisStr, sanitizedDoc),
      PrepareResponseSchema
    );

    return NextResponse.json(result);

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
