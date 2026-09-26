import { INDIA_LEGAL_CONTEXT, computeRiskScore, getRiskLevel } from '@/lib/legalContext';

describe('India Legal Context', () => {
  test('INDIA_LEGAL_CONTEXT has entries for document types', () => {
    expect(INDIA_LEGAL_CONTEXT.rental_agreement).toBeDefined();
    expect(INDIA_LEGAL_CONTEXT.employment_contract).toBeDefined();
    expect(INDIA_LEGAL_CONTEXT.nda).toBeDefined();
    expect(INDIA_LEGAL_CONTEXT.legal_notice).toBeDefined();
    expect(INDIA_LEGAL_CONTEXT.loan_agreement).toBeDefined();

    expect(INDIA_LEGAL_CONTEXT.rental_agreement.governingLaw).toContain('Transfer of Property Act');
  });

  test('computeRiskScore calculates correctly for known inputs', () => {
    expect(computeRiskScore(1, 1, 1)).toBe(15 + 5 + 8); // 28
    expect(computeRiskScore(2, 0, 0)).toBe(30);
    expect(computeRiskScore(0, 4, 0)).toBe(20);
    expect(computeRiskScore(10, 10, 10)).toBe(100);
  });

  test('getRiskLevel returns correct level for boundary values (25, 26, 50, 51, 75, 76)', () => {
    expect(getRiskLevel(25)).toBe('low');
    expect(getRiskLevel(26)).toBe('moderate');
    expect(getRiskLevel(50)).toBe('moderate');
    expect(getRiskLevel(51)).toBe('high');
    expect(getRiskLevel(75)).toBe('high');
    expect(getRiskLevel(76)).toBe('critical');
  });
});
