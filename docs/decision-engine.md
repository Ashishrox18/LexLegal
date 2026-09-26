# LexAI Decision Engine

## How Gemini Analysis Works
- **Model**: `gemini-2.0-flash`
- **Temperature**: `0.1` (Low temperature for deterministic, consistent extraction)
- **Top P**: `0.8`
- **Structured JSON Only**: Prompts explicitly enforce raw JSON response without markdown wrappers.
- **Validation**: All responses pass through Zod schemas (`DecodeResponseSchema`, `CompareResponseSchema`, `PrepareResponseSchema`, `AskResponseSchema`) before reaching client UI.

---

## Risk Score Calculation
Risk score calculation is **deterministic** (not calculated by AI) to ensure maximum consistency and objectivity:

$$\text{Risk Score} = \min(100, (\text{Red Flags} \times 15) + (\text{Yellow Flags} \times 5) + (\text{Missing Clauses} \times 8))$$

### Risk Levels
- **0 - 25**: `low` (Green)
- **26 - 50**: `moderate` (Amber/Yellow)
- **51 - 75**: `high` (Orange)
- **76 - 100**: `critical` (Red)

---

## India Legal Context Injection
Every decode prompt dynamically includes `INDIA_LEGAL_CONTEXT` (`lib/legalContext.ts`) covering:
- **Rental Agreements**: Transfer of Property Act 1882, Registration Act 1908, State Rent Control Acts (e.g., Maharashtra 2-month deposit limit).
- **Employment Contracts**: Industrial Disputes Act 1947, PF Act, Payment of Gratuity Act, Section 27 non-compete enforceability.
- **NDAs**: Indian Contract Act 1872 Section 27 (Restraint of trade).
- **Legal Notices**: Code of Civil Procedure 1908 (30-day notice response norm).
- **Loan Agreements**: Indian Contract Act 1872 + RBI Lending Guidelines.

---

## Flag Classification Logic
- 🔴 **Red Flag**: Clause violates statutory rights, imposes excessive penalties, allows unilateral termination without notice, or violates Indian case law.
- 🟡 **Yellow Flag**: Clause is vague, ambiguous, or slightly one-sided (e.g., 90-day notice period or high security deposit).
- 🟢 **Green Flag**: Clause explicitly protects the user or conforms to standard fair practices under Indian law.

---

## Document Type Detection
Gemini automatically classifies document content into one of 10 categories:
`rental_agreement`, `employment_contract`, `nda`, `service_agreement`, `loan_agreement`, `legal_notice`, `sale_deed`, `power_of_attorney`, `partnership_deed`, or `other`.
Confidence scores (0.0 to 1.0) are calculated and displayed on the UI.
