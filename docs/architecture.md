# LexAI System Architecture

> **Tagline:** *Understand before you sign. Know before you act.*

## Overview
LexAI is a GenAI-powered legal document intelligence platform tailored for India. It processes legal agreements server-side using Next.js 14 App Router API routes, calling Gemini 2.0 Flash (`gemini-2.0-flash`) and validating all data exchanges strictly using Zod schemas.

```
Browser (UI) ──► Next.js API Routes (/api/*) ──► Gemini 2.0 Flash API ──► Zod Validation ──► Browser UI
```

---

## Data Flow

### 1. Decode Flow
1. **User Input**: User pastes contract text or uploads a PDF on `/decode`.
2. **PDF Parsing (if applicable)**: POST `/api/parse-pdf` extracts plain text server-side using `pdf-parse`.
3. **API Processing**: POST `/api/decode` receives `{ documentText, userId }`.
4. **Sanitization**: Server strips HTML/script tags and normalizes whitespace.
5. **AI Call**: Calls Gemini 2.0 Flash (`gemini-2.0-flash`) with structured output instructions and Indian legal context.
6. **Zod Validation**: Server parses raw Gemini JSON through `DecodeResponseSchema`.
7. **Client Rendering**: UI updates Zustand store and renders typed `DecodeResults` components.
8. **Storage**: Summary + risk score stored safely in client `localStorage` with Zod validation.

### 2. Compare Flow
1. User provides Document A and Document B on `/compare`.
2. POST `/api/compare` sends both documents to Gemini for comparative diff.
3. Output validated against `CompareResponseSchema` and rendered in `CompareResults` diff table.

### 3. Prepare Flow
1. Analysis object passed from `/decode` or generated fresh on `/prepare`.
2. POST `/api/prepare` generates lawyer brief, Indian statutory rights, checklist, and redlines.

### No Document Storage Policy
- Documents are processed **in-memory only** on the server.
- They are never written to disk, database, or server cache.
- Privacy by design: document content remains private to the user session.

---

## Component Hierarchy

```
app/
├── layout.tsx (Root Layout, Skip Link, DisclaimerBanner, Header)
├── page.tsx (Landing Page, Hero, 3 Mode Cards, History)
├── decode/page.tsx (Document Decoder Workspace)
├── compare/page.tsx (Side-by-Side Comparison Workspace)
└── prepare/page.tsx (Lawyer Brief & Checklist Workspace)

components/
├── ui/
│   ├── DisclaimerBanner.tsx (Sticky Legal Disclaimer)
│   ├── RiskGauge.tsx (Animated SVG Arc Gauge)
│   ├── ClauseCard.tsx (Flag-colored Clause Display)
│   ├── DocumentUpload.tsx (Drag-Drop + Paste + PDF Upload Zone)
│   ├── LoadingAnalysis.tsx (Animated Skeleton Steps)
│   ├── FlagBadge.tsx (Red/Yellow/Green Pill Badge)
│   └── ErrorBoundary.tsx (React Error Boundary)
└── features/
    ├── DecodeResults.tsx (Full Analysis View)
    ├── CompareResults.tsx (Side-by-Side Diff Table)
    ├── PrepareResults.tsx (Lawyer Brief & Interactive Checklist)
    ├── AskQuestion.tsx (Document Q&A Interface)
    └── DocumentTypeDetector.tsx (Detected Type & Jurisdiction Chip)
```

---

## State Management
- **Zustand (`hooks/useDecodeStore`, `useCompareStore`)**: Manages active document text, loading states, and current result objects in browser memory.
- **LocalStorage (`lib/storage`)**: Stores up to 20 document history summaries validated via Zod on every read and write. Corrupted data is silently recovered without crashing.
