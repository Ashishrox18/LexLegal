describe('Compare Flow E2E', () => {
  it('navigates to /compare and allows pasting two documents for comparison', () => {
    cy.visit('/compare');
    cy.contains('Side-by-Side Contract Comparison').should('be.visible');

    cy.get('textarea#document-text-input').first().type('A'.repeat(100));
    cy.get('textarea#document-text-input').last().type('B'.repeat(100));

    cy.contains('Compare Both Documents').should('not.be.disabled').click();
    cy.contains('LexAI Legal Intelligence Engine').should('be.visible');
  });
});
