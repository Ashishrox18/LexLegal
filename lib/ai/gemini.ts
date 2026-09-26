// This file runs server-side only. Never import in client components.
// Uses Groq API (OpenAI-compatible) instead of Gemini.

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY; // NO NEXT_PUBLIC_ prefix
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  let lastError: Error | null = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a legal document analysis AI expert specializing in Indian law. Always respond with valid JSON only — no markdown fences, no explanatory text outside the JSON structure.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,       // Low temp for consistent structured output
          top_p: 0.8,
          max_tokens: 8192,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429) {
          lastError = new Error('RATE_LIMITED');
          continue;
        }
        lastError = new Error(`Groq API error (${model}): ${response.status} - ${errorText.slice(0, 200)}`);
        continue;
      }

      const data = await response.json();
      let text = data?.choices?.[0]?.message?.content;
      if (!text) {
        lastError = new Error(`Empty response from Groq model ${model}`);
        continue;
      }

      // If reasoning tokens or reasoning text exist, strip it out if model is gpt-oss
      if (text.includes('</reasoning>')) {
        text = text.split('</reasoning>').pop() || text;
      }

      return text;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('All Groq models failed');
}

// Parse and validate Groq JSON response
export async function callGeminiStructured<T>(
  prompt: string,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  const rawText = await callGemini(prompt);

  // Strip markdown code fences if present
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  return schema.parse(parsed); // Zod validates structure
}
