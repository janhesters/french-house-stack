import { USER_AUTHENTICATION_SESSION_NAME } from '~/features/user-authentication/user-authentication-constants.server';

describe('home page', () => {
  it("redirects you to the login page when you're logged out and remembers the page as the redirectTo query parameter", () => {
    cy.visit('/home');
    const expectedUrl = new URL(Cypress.config().baseUrl + '/login');
    expectedUrl.searchParams.append('redirectTo', '/home');
    cy.url().should('equal', expectedUrl.href);
  });

  it("has the correct title and renders the user's email when they're logged in and lets the user log out", () => {
    // TODO: refactor when Magic supports server side test mode.
    cy.intercept('/logout', request => {
      Cypress.automation('clear:cookie', {
        name: USER_AUTHENTICATION_SESSION_NAME,
      });
      request.redirect('/', 302);
    }).as('logout');

    cy.loginByCookie().then(({ email }) => {
      cy.visit('/home');

      // The page has the correct tile.
      cy.title().should('eq', 'Home | French House Stack');

      // Retrieves the users data.
      cy.findByText(email).should('exist');

      // Logging the user out should redirect you to the landing page.
      cy.findByRole('button', { name: /open user menu/i }).click();
      cy.findByRole('menuitem', { name: /log out/i }).click();
      cy.url().should('equal', Cypress.config().baseUrl + '/');

      // Verify that the user is really logged out by trying to visit the home
      // page and getting redirected to login.
      cy.visit('/home');
      const expectedUrl = new URL(Cypress.config().baseUrl + '/login');
      expectedUrl.searchParams.append('redirectTo', '/home');
      cy.url().should('include', '/login');
    });
  });
});
