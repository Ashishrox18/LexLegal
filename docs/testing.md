# LexAI Test Strategy

## Test Suite Overview
The application is tested with Jest, React Testing Library, `jest-axe`, and Cypress.

- **Unit Tests (28)**:
  - `riskScorer.test.ts`: Deterministic score calculations & risk level bounds.
  - `sanitize.test.ts`: HTML tag removal, script stripping, null byte removal, length truncation.
  - `schemas.test.ts`: Zod validation on AI outputs, storage schemas, and request payloads.
  - `storage.test.ts`: LocalStorage read/write validation, UUID persistence, item capping.
  - `legalContext.test.ts`: India legal database context integrity.
- **Integration Tests (9)**:
  - `api-decode.test.ts`: Input validation, rate limiting, and error handling for `/api/decode`.
  - `api-compare.test.ts`: Dual-document validation for `/api/compare`.
  - `storage-corruption.test.ts`: Graceful recovery when localStorage contains corrupted JSON.
- **Accessibility Tests (3)**:
  - `landing.a11y.test.tsx`, `decode.a11y.test.tsx`, `prepare.a11y.test.tsx` using `jest-axe`.
- **Cypress E2E Flows (3)**:
  - `decode-flow.cy.ts`: End-to-end decode journey.
  - `compare-flow.cy.ts`: End-to-end compare journey.
  - `prepare-flow.cy.ts`: End-to-end lawyer brief journey.

Total Test Count: 43 Tests

---

## How to Run Tests

```bash
# Run unit, integration, and accessibility tests
npm test

# Run tests with coverage report
npm run test:coverage

# Open Cypress E2E runner
npm run cypress:open

# Run Cypress E2E headless
npm run cypress:run
```

---

## Coverage Targets
- `lib/`: 90%+
- `schemas/`: 100%
- `components/ui/`: 80%+
