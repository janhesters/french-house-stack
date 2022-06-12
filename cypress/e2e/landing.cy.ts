describe('landing page', () => {
  it('has the correct title and renders a greeting', () => {
    cy.visit('/');
    cy.title().should('eq', 'French House Stack');
    cy.get('h1').contains('French House Stack');
  });

  it("redirects you to the home page when you're logged in", () => {
    cy.loginByCookie();
    cy.visit('/');
    cy.url().should('equal', Cypress.config().baseUrl + '/home');
  });
});
