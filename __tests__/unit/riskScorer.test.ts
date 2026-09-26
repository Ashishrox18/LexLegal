import { computeRiskScore, getRiskLevel } from '@/lib/riskScorer';

describe('Risk Score Calculator', () => {
  test('0 red flags, 0 yellow, 0 missing → score 0 (low risk)', () => {
    const score = computeRiskScore(0, 0, 0);
    expect(score).toBe(0);
    expect(getRiskLevel(score)).toBe('low');
  });

  test('3 red flags → score 45 (moderate)', () => {
    const score = computeRiskScore(3, 0, 0);
    expect(score).toBe(45);
    expect(getRiskLevel(score)).toBe('moderate');
  });

  test('5 red flags + 3 yellow → score 90 (critical)', () => {
    const score = computeRiskScore(5, 3, 0);
    expect(score).toBe(90);
    expect(getRiskLevel(score)).toBe('critical');
  });

  test('score is capped at 100 regardless of flag count', () => {
    const score = computeRiskScore(10, 10, 10);
    expect(score).toBe(100);
    expect(getRiskLevel(score)).toBe('critical');
  });

  test('getRiskLevel maps 0-25 to low, 26-50 moderate, 51-75 high, 76+ critical', () => {
    expect(getRiskLevel(0)).toBe('low');
    expect(getRiskLevel(25)).toBe('low');
    expect(getRiskLevel(26)).toBe('moderate');
    expect(getRiskLevel(50)).toBe('moderate');
    expect(getRiskLevel(51)).toBe('high');
    expect(getRiskLevel(75)).toBe('high');
    expect(getRiskLevel(76)).toBe('critical');
    expect(getRiskLevel(100)).toBe('critical');
  });
});
