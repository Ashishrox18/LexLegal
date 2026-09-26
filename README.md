# ⚖️ LexLegal — GenAI-Powered Legal Document Intelligence

> **Tagline:** *"Understand before you sign. Know before you act."*
> **Built for:** Google Prompt Wars — Legal Information & Assistance Challenge Vertical

---

## 📌 Chosen Vertical & Problem Statement

Legal information in India is often complex, wrapped in dense legal jargon, and difficult to understand without expensive professional assistance. Everyday citizens signing rental agreements, employment contracts, NDAs, or loan deeds frequently agree to unfavorable or illegal terms simply because they cannot read or interpret the fine print.

**LexLegal** makes legal information and basic assistance accessible to everyone by helping users understand, compare, and navigate legal documents with AI-driven clarity, India-specific statutory context, and lawyer-ready actionable outputs.

---

## 🚀 Key Features & Hackathon Use Cases Alignment

| Hackathon Potential Use Case | LexLegal Feature Implementation |
|---|---|
| **Simplifying complex legal documents** | **Decode Mode**: Extracts plain-English summaries & "Explain Like I'm 5" (ELI5) breakdowns for every clause. |
| **Comparing contracts, agreements, or policies** | **Compare Mode**: Side-by-side comparison of Document A vs. Document B, showing risk deltas, diff tables, and favorable version verdicts. |
| **Highlighting important clauses, risks, or inconsistencies** | **Flag Engine & Missing Clauses**: Categorizes clauses into 🔴 Red Flags, 🟡 Yellow Flags, and 🟢 Green Protections, and flags missing statutory protections. |
| **Answering questions based on legal documents** | **Ask AI Widget**: Context-aware Q&A assistant tailored to the user's uploaded document with suggested follow-up prompts. |
| **Helping users understand options & next steps** | **Action Pathways**: Categorizes options into **DIY**, **Negotiate**, or **Consult Lawyer** paths with estimated costs and timeframes. |
| **Generating summaries & checklists** | **Interactive Action Checklist**: Auto-generated checklist with priority tags, progress bar, and local storage persistence. |
| **Preparing information for a legal professional** | **Lawyer Preparation Brief**: One-click printable PDF brief and copyable question checklist formatted for consultation. |

---

## 🧠 Approach & Solution Logic

### 1. Hybrid Intelligence Model (Deterministic Rules + GenAI)
- **Deterministic Risk Scoring**: Risk scores (0–100) are computed using a deterministic algorithm grounded in Indian statutes (e.g., Transfer of Property Act 1882, Indian Contract Act 1872, Industrial Disputes Act 1947), ensuring consistent and transparent scoring.
- **Structured GenAI Extraction**: Powered by Google Gemini 2.0 Flash (`gemini-2.0-flash`) and Groq API (`qwen/qwen3.8-27b` / `llama-3.3-70b-versatile` with automatic failover) to generate structured JSON responses validated against strict Zod schemas.

### 2. Privacy-First In-Memory Processing
- Uploaded contracts and PDFs are processed strictly in server RAM during request execution.
- **Zero Database / Zero File Persistence**: User documents are never stored on external servers or databases.

### 3. Anonymous Lightweight Identity
- Per hackathon rules prohibiting authentication, identity is handled via a client-generated UUID saved safely in `localStorage` with silent corruption recovery.

---

## 🏗️ Architecture & How It Works

```
Browser (Next.js 14 Client) 
   └── API Request with Document Text + UUID
        └── Next.js API Routes (Server-Side Proxy: /api/decode, /api/compare, /api/prepare, /api/ask)
             ├── Input Sanitization (lib/sanitize.ts)
             ├── Gemini 2.0 Flash / Groq LLM API (Server-side Bearer/API Key Auth)
             ├── Zod Schema Validation & Coercion (schemas/ai-responses.ts)
             └── Deterministic Risk Scorer (lib/riskScorer.ts)
                  └── Structured JSON Response → Dynamic Accessible UI
```

---

## 📋 Assumptions Made

1. **Information vs. Legal Advice**: LexLegal provides legal information and preparation assistance, not binding legal counsel. Prominent disclaimers are rendered across all pages and printable briefs.
2. **Jurisdiction Scope**: Injected prompts and legal context specifically reference Indian federal and state laws (e.g., Rent Control Acts, Employment Laws, Contract Act Sec 27).
3. **Environment Isolation**: `GEMINI_API_KEY` / `GROQ_API_KEY` lives exclusively in server-side `.env.local` without `NEXT_PUBLIC_` prefixes to prevent browser key leakage.

---

## 🧪 Evaluation Focus Areas & Compliance

| Evaluation Metric | Implementation Quality in LexLegal |
|---|---|
| **Code Quality** | Strict TypeScript mode (`noImplicitAny`, `strictNullChecks`), zero `any` types, modular component hierarchy. |
| **Security** | Input sanitization (script/HTML stripping), server-side API proxying, HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`). |
| **Efficiency** | Lightweight 0.46 MB source repository size (**under the 10 MB limit**), fast in-memory execution. |
| **Testing** | Complete test suite with 41 unit/integration/accessibility tests (`npm test`) + 3 Cypress E2E test flows (`npm run cypress:run`). |
| **Accessibility** | WCAG 2.1 AA compliant: Skip-to-content links, ARIA tab roles, keyboard navigation, 4.5:1 color contrast, and reduced-motion support. |

---

## ⚙️ Local Setup & Running Instructions

### Prerequisites
- Node.js v18+ or v20+
- npm v9+

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Configure Environment Key
cp .env.local.example .env.local
# Add your GEMINI_API_KEY or GROQ_API_KEY in .env.local

# 3. Start local development server
npm run dev
# Open http://localhost:3000 in browser
```

---

## 🧪 Verification Commands

```bash
# Run unit, integration, and WCAG accessibility tests (41 tests)
npm test

# Run Next.js production build
npm run build

# Run Cypress E2E test flows
npm run cypress:run
```

---

## ⚠️ Disclaimer
LexLegal provides legal information for educational and preparation purposes only and does not constitute formal legal advice. Always consult a licensed advocate or legal professional for formal legal proceedings.
