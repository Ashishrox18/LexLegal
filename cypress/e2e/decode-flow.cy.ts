describe('Decode Flow E2E', () => {
  it('navigates to /decode, pastes document text, and triggers analysis', () => {
    cy.visit('/decode');
    cy.contains('Document Decoder Workspace').should('be.visible');

    const sampleDoc = `
      RENTAL AGREEMENT
      This Rental Agreement is made on 01 January 2025 between Landlord Mr. Sharma and Tenant Mr. Verma.
      1. Security Deposit: Tenant shall pay 10 months rent as refundable deposit.
      2. Notice Period: Either party can terminate with 30 days written notice.
      3. Eviction: Landlord reserves right to enter premises at any time without notice.
    `;

    cy.get('textarea#document-text-input').type(sampleDoc);
    cy.contains('Analyze Document').should('not.be.disabled').click();

    cy.contains('Reading document & parsing text...').should('be.visible');
  });
});
