import { NextResponse } from 'next/server';
import { callGeminiStructured } from '@/lib/ai/gemini';
import { buildDecodePrompt } from '@/lib/ai/prompts';
import { DecodeRequestSchema, DecodeResponseSchema } from '@/schemas/ai-responses';
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
    
    // Validate request body
    const parseResult = DecodeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Please provide a valid document (minimum 50 characters).' },
        { status: 400 }
      );
    }
    const { documentText, userId } = parseResult.data;
    
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    // Sanitize before sending to AI
    const sanitized = sanitizeDocument(documentText);
    
    // Call Groq AI with structured output validation
    const result = await callGeminiStructured(
      buildDecodePrompt(sanitized),
      DecodeResponseSchema
    );

    return NextResponse.json(result);

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
