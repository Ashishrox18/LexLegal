import { POST } from '@/app/api/compare/route';

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

describe('POST /api/compare', () => {
  test('returns 400 when either document is missing or too short', async () => {
    const req = createMockRequest({
      documentAText: 'Short text A',
      documentBText: 'A'.repeat(100),
      userId: '12345678-1234-1234-1234-123456789012',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('returns 500 with user-friendly message on unexpected AI error', async () => {
    const { callGeminiStructured } = require('@/lib/ai/gemini');
    callGeminiStructured.mockRejectedValueOnce(new Error('Network error'));

    const req = createMockRequest({
      documentAText: 'A'.repeat(100),
      documentBText: 'B'.repeat(100),
      userId: '12345678-1234-1234-1234-123456789012',
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('Comparison failed');
  });
});
