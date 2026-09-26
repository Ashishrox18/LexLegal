# LexAI Security & Privacy Model

## API Key Storage
- `GROQ_API_KEY` lives **exclusively** in server-side `.env.local`.
- **NO `NEXT_PUBLIC_` prefix**: Key is never exposed to browser bundles.
- All AI calls are strictly proxied through Next.js server-side API routes (`/api/decode`, `/api/compare`, `/api/prepare`, `/api/ask`).

---

## Input Sanitization
Implemented in `lib/sanitize.ts`:
- `<script>` tags aggressively stripped.
- HTML tags removed.
- Null bytes (`\0`) removed.
- Character limit enforced: 50,000 chars for documents, 500 chars for Q&A inputs.

---

## Document Privacy
- **In-Memory Processing**: Uploaded document text is processed transiently in server RAM.
- **No Database / No Storage**: Documents are never saved to a database, local storage, or file system.
- **Client Identity**: UUID stored in localStorage as non-sensitive anonymous identifier.

---

## Rate Limiting
Server-side in-memory rate limiting per user ID:
- `/api/decode`: 10 requests per minute.
- `/api/compare`: 10 requests per minute.
- `/api/prepare`: 10 requests per minute.
- `/api/ask`: 15 requests per minute.
Returns HTTP 429 when limits are exceeded.

---

## localStorage Safety
- Wrapped by `safeGet` and `safeSet` in `lib/storage/index.ts`.
- **Zod Validation on Read AND Write**: Storage structure is validated against `StorageSchema`.
- **Corruption Recovery**: Malformed JSON or schema mismatches cause the store to be silently reset without crashing the application.

---

## Security Headers
Configured in `next.config.ts`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation()`
