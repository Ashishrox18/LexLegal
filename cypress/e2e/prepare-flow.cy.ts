describe('Prepare Flow E2E', () => {
  it('navigates to /prepare and loads document brief generator', () => {
    cy.visit('/prepare');
    cy.contains('Lawyer Preparation Brief & Checklist').should('be.visible');

    const sampleDoc = 'A'.repeat(100);
    cy.get('textarea#document-text-input').type(sampleDoc);

    cy.contains('Generate Lawyer Brief & Checklist').should('not.be.disabled').click();
    cy.contains('LexAI Legal Intelligence Engine').should('be.visible');
  });
});
