export const INDIA_LEGAL_CONTEXT = {
  rental_agreement: {
    governingLaw: 'Transfer of Property Act 1882 + State Rent Control Acts',
    keyFacts: [
      'Security deposit: legally limited to 2-3 months rent in most states',
      'Agreements > 11 months MUST be registered (Registration Act 1908)',
      'Landlord must give minimum 30 days written notice before eviction',
      'Rent increase must be mutually agreed or as per state rent control',
    ],
    redFlagPatterns: [
      'deposit exceeding 3 months',
      'eviction without notice',
      'landlord entry without permission',
      'unilateral rent increase',
      'no dispute resolution clause',
    ],
    stateVariations: 'Maharashtra: max 2 months deposit | Delhi: no statutory limit | Karnataka: max 10 months',
  },
  employment_contract: {
    governingLaw: 'Industrial Disputes Act 1947 + Shops & Establishments Acts (state-wise)',
    keyFacts: [
      'PF mandatory for companies with 20+ employees (12% employee + 12% employer)',
      'Gratuity payable after 5 years continuous service',
      'Notice period: typically 30-90 days, must be mutual',
      'Non-compete clauses have limited enforceability post-employment in India',
    ],
    redFlagPatterns: [
      'IP clause covering personal projects outside work',
      'unlimited working hours with no overtime',
      'perpetual or very long non-compete',
      'no severance or notice period',
      'unilateral salary changes',
    ],
  },
  nda: {
    governingLaw: 'Indian Contract Act 1872, Section 27',
    keyFacts: [
      'Reasonable duration: 2-3 years typically enforceable',
      'Must define confidential information specifically',
      'Trade secrets have no specific statute in India',
      'Courts have struck down overly broad NDAs',
    ],
    redFlagPatterns: [
      'perpetual confidentiality obligation',
      'no geographic limitation',
      'vague definition of confidential information',
      'penalties disproportionate to actual damage',
    ],
  },
  legal_notice: {
    governingLaw: 'Code of Civil Procedure 1908',
    keyFacts: [
      'Standard response time: 30 days from receipt',
      'Ignoring a legal notice can be used against you in court',
      'Response should be in writing via registered post',
      'Consult a lawyer before responding to serious notices',
    ],
    redFlagPatterns: [
      'response deadline under 7 days',
      'vague or unspecified claims',
      'demands disproportionate to alleged injury',
      'threatening language without legal basis',
    ],
  },
  loan_agreement: {
    governingLaw: 'Indian Contract Act 1872 + RBI Guidelines',
    keyFacts: [
      'Interest rate must be clearly stated (FEMA regulations for cross-border)',
      'Prepayment terms and penalties must be explicit',
      'Collateral/security terms must be registered if applicable',
      'RBI regulates NBFCs and licensed lenders',
    ],
    redFlagPatterns: [
      'compound interest not clearly disclosed',
      'no prepayment option',
      'excessive processing fees',
      'cross-default clauses',
    ],
  },
};

export function computeRiskScore(
  redFlagCount: number,
  yellowFlagCount: number,
  missingClauseCount: number
): number {
  const raw = (redFlagCount * 15) + (yellowFlagCount * 5) + (missingClauseCount * 8);
  return Math.min(100, raw);
}

export function getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (score <= 25) return 'low';
  if (score <= 50) return 'moderate';
  if (score <= 75) return 'high';
  return 'critical';
}
