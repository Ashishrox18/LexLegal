import { POST } from '@/app/api/decode/route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({
      status: init?.status || 200,
      json: async () => body,
    }),
  },
}));

jest.mock('@/lib/ai/gemini', () => ({
  callGeminiStructured: jest.fn(),
}));

function createMockRequest(body: unknown): Request {
  return {
    json: async () => body,
  } as unknown as Request;
}

describe('POST /api/decode', () => {
  test('returns 400 when documentText is too short (< 50 chars)', async () => {
    const req = createMockRequest({
      documentText: 'Too short text',
      userId: '12345678-1234-1234-1234-123456789012',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('minimum 50 characters');
  });

  test('returns 400 when userId is not a valid UUID', async () => {
    const req = createMockRequest({
      documentText: 'A'.repeat(100),
      userId: 'not-a-valid-uuid',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('returns 422 with user-friendly message when AI output validation fails', async () => {
    const { callGeminiStructured } = require('@/lib/ai/gemini');
    callGeminiStructured.mockRejectedValueOnce(
      new (require('zod').ZodError)([])
    );

    const req = createMockRequest({
      documentText: 'A'.repeat(100),
      userId: '12345678-1234-1234-1234-123456789012',
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toContain('unexpected results');
  });
});
