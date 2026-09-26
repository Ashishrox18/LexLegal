import {
  DecodeResponseSchema,
  ClauseSchema,
  CompareResponseSchema,
  PrepareResponseSchema,
  AskResponseSchema,
} from '@/schemas/ai-responses';

describe('Zod AI Response Schemas', () => {
  const validClause = {
    id: 'clause_1',
    title: 'Security Deposit',
    originalText: 'The tenant shall pay 10 months deposit.',
    plainEnglish: 'Tenant pays 10 months rent as deposit.',
    eli5: 'You give a big deposit.',
    flag: 'yellow',
    reason: '10 months is high in Karnataka.',
    lawCited: 'Transfer of Property Act 1882',
    actionable: 'Negotiate down to 5 months.',
    category: 'deposit',
  };

  const validDecode = {
    documentType: 'rental_agreement',
    jurisdiction: 'Bengaluru, India',
    partiesInvolved: ['Landlord: A', 'Tenant: B'],
    riskScore: 45,
    riskLevel: 'moderate',
    summary: 'A standard rental agreement with 10 months deposit.',
    eli5Summary: 'House rent agreement.',
    keyDates: [{ label: 'Start Date', date: '2025-01-01', importance: 'high', note: null }],
    clauses: [validClause],
    redFlags: ['Unilateral rent increase'],
    yellowFlags: ['10 months deposit'],
    greenFlags: ['30 days notice required'],
    missingClauses: ['Dispute resolution clause'],
    overallRecommendation: 'Negotiate deposit before signing.',
    confidence: 0.9,
  };

  test('valid decode response passes all schema checks', () => {
    const parsed = DecodeResponseSchema.safeParse(validDecode);
    expect(parsed.success).toBe(true);
  });

  test('DecodeResponseSchema rejects riskScore > 100', () => {
    const invalid = { ...validDecode, riskScore: 150 };
    const parsed = DecodeResponseSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  test('DecodeResponseSchema rejects invalid documentType', () => {
    const invalid = { ...validDecode, documentType: 'invalid_contract' };
    const parsed = DecodeResponseSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  test('ClauseSchema requires flag to be red|yellow|green only', () => {
    const invalid = { ...validClause, flag: 'blue' };
    const parsed = ClauseSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  test('CompareResponseSchema requires riskDelta between -100 and 100', () => {
    const validCompare = {
      docAType: 'rental_agreement',
      docBType: 'rental_agreement',
      overallVerdict: 'Doc B is better.',
      riskDelta: 20,
      docARiskScore: 40,
      docBRiskScore: 60,
      favorableVersion: 'A',
      changes: [],
      addedClauses: [],
      removedClauses: [],
      keyDifferences: ['Deposit changed'],
      recommendation: 'Keep Version A.',
      confidence: 0.85,
    };
    expect(CompareResponseSchema.safeParse(validCompare).success).toBe(true);

    const invalidCompare = { ...validCompare, riskDelta: 200 };
    expect(CompareResponseSchema.safeParse(invalidCompare).success).toBe(false);
  });

  test('PrepareResponseSchema validates structure', () => {
    const validPrepare = {
      situationSummary: 'Tenant signing lease.',
      urgencyLevel: 'moderate',
      actWithinDays: 15,
      yourRights: ['Right to notice'],
      questionsForLawyer: ['Is 90-day notice valid?'],
      nextSteps: [{ option: 'negotiate', action: 'Ask for 30 days', riskLevel: 'low', estimatedCost: null, timeframe: null }],
      checklistItems: [{ id: '1', task: 'Check deposit', priority: 'high', done: false, note: null }],
      redLinesDoNotSign: ['Immediate eviction without notice'],
      negotiationPoints: ['Notice period'],
      relevantLaws: [{ name: 'Transfer of Property Act 1882', relevance: 'Governs leases' }],
    };
    expect(PrepareResponseSchema.safeParse(validPrepare).success).toBe(true);
  });

  test('AskResponseSchema rejects confidence outside 0-1', () => {
    const invalidAsk = {
      answer: 'Yes.',
      confidence: 1.5,
      relevantClauses: [],
      caveat: null,
      suggestedFollowUps: [],
    };
    expect(AskResponseSchema.safeParse(invalidAsk).success).toBe(false);
  });

  test('valid compare response passes all schema checks', () => {
    const validCompare = {
      docAType: 'nda',
      docBType: 'nda',
      overallVerdict: 'Version B is less restrictive.',
      riskDelta: -15,
      docARiskScore: 50,
      docBRiskScore: 35,
      favorableVersion: 'B',
      changes: [
        {
          clauseTitle: 'Duration',
          docAText: 'Perpetual',
          docBText: '2 years',
          changeType: 'modified',
          impact: 'positive',
          explanation: 'Reduced duration',
          flag: 'green',
        },
      ],
      addedClauses: [],
      removedClauses: [],
      keyDifferences: ['Duration reduced from perpetual to 2 years'],
      recommendation: 'Accept Version B',
      confidence: 0.95,
    };
    expect(CompareResponseSchema.safeParse(validCompare).success).toBe(true);
  });
});
