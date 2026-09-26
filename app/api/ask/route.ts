import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured } from '@/lib/ai/gemini';
import { buildAskPrompt } from '@/lib/ai/prompts';
import { AskRequestSchema, AskResponseSchema } from '@/schemas/ai-responses';
import { sanitizeDocument, sanitizeQuestion } from '@/lib/sanitize';
import { ZodError } from 'zod';

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 15) return true; // 15 Q&A req/min per user
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, documentText, userId } = AskRequestSchema.parse(body);

    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    const sanitizedQ = sanitizeQuestion(question);
    const sanitizedDoc = sanitizeDocument(documentText);

    const result = await callGeminiStructured(
      buildAskPrompt(sanitizedQ, sanitizedDoc),
      AskResponseSchema
    );

    return NextResponse.json(result);

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
