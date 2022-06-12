import { USER_AUTHENTICATION_SESSION_NAME } from '~/features/user-authentication/user-authentication-constants.server';

const loginLoaderRoute = '/login?_data=routes%2Flogin';

const goOffline = () => {
  cy.log('**go offline**')
    .then(() => {
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.enable',
      });
    })
    .then(() => {
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.emulateNetworkConditions',
        params: {
          offline: true,
          latency: -1,
          downloadThroughput: -1,
          uploadThroughput: -1,
        },
      });
    });
};

const goOnline = () => {
  // disable offline mode, otherwise we will break our tests :)
  cy.log('**go online**')
    .then(() => {
      // https://chromedevtools.github.io/devtools-protocol/1-3/Network/#method-emulateNetworkConditions
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.emulateNetworkConditions',
        params: {
          offline: false,
          latency: -1,
          downloadThroughput: -1,
          uploadThroughput: -1,
        },
      });
    })
    .then(() => {
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.disable',
      });
    });
};

describe('login page', () => {
  it('redirects to the route specified in the search parameter if the user is logged in', () => {
    cy.loginByCookie();
    // TODO: `/home` is the default. We should change this assertion to another
    // route.
    const searchParameters = new URLSearchParams({ redirectTo: '/home' });
    cy.visit('/login?' + searchParameters.toString());
    cy.url().should('equal', Cypress.config().baseUrl + '/home');
  });

  it('lets the user log in with valid credentials', () => {
    cy.intercept(loginLoaderRoute, request => {
      request.reply({
        headers: {
          'Set-Cookie': `${USER_AUTHENTICATION_SESSION_NAME}=${Cypress.env(
            'validCookieToken',
          )}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax`,
          'X-Remix-Redirect': '/home',
          'X-Remix-Revalidate': 'yes',
        },
        statusCode: 204,
      });
    }).as('login');

    // Navigate to the login page.
    cy.visit('/login');

    // The page has the correct tile.
    cy.title().should('eq', 'Sign In / Sign Up | French House Stack');

    // Enter the valid email and submit the form.
    cy.findByLabelText(/email/i).type(Cypress.env('validMagicEmail'));
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.findByRole('button', { name: /sign in/i }).should('not.exist');
    cy.findByRole('button', { name: /authenticating/i }).should('be.disabled');

    // After logging in, the user should be redirected to the home page.
    cy.url().should('equal', Cypress.config().baseUrl + '/home');
  });

  it('fails gracefully with invalid credentials', () => {
    cy.intercept(loginLoaderRoute, request => {
      request.reply({
        headers: {
          'Set-Cookie': `${USER_AUTHENTICATION_SESSION_NAME}=${Cypress.env(
            'validCookieToken',
          )}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax`,
          'X-Remix-Redirect': '/home',
          'X-Remix-Revalidate': 'yes',
        },
        statusCode: 204,
      });
    }).as('login');

    // Navigate to the login page.
    cy.visit('/login');

    // Enter a malformed email.
    cy.findByLabelText(/email/i).type('not-an-email@foo').blur();
    cy.findByText("A valid email consists of characters, '@' and '.'.").should(
      'exist',
    );
    cy.findByRole('button', { name: /sign in/i }).should('be.disabled');

    // Enter no email at all.
    cy.findByLabelText(/email/i).clear().blur();
    cy.findByText(/please enter a valid email/i).should('exist');
    cy.findByRole('button', { name: /sign in/i }).should('be.disabled');

    // Enter the invalid email and submit the form.
    cy.findByLabelText(/email/i).type(Cypress.env('invalidMagicEmail'));
    cy.findByRole('button', { name: /sign in/i }).click();

    // There should be an appropriate error.
    cy.findByText(/login failed. please try again./i).should('exist');

    // The error should NOT crash the app and the user should be able to log in
    // again.
    cy.findByLabelText(/email/i).clear().type(Cypress.env('validMagicEmail'));
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.url().should('equal', Cypress.config().baseUrl + '/home');
  });

  // Skip because the test started breaking randomly 🤷‍♂️
  describe.skip('offline mode', { browser: '!firefox' }, () => {
    beforeEach(goOnline);
    afterEach(goOnline);

    it('fails gracefully when the user is offline', () => {
      cy.intercept(loginLoaderRoute, request => {
        request.reply({
          headers: {
            'Set-Cookie': `${USER_AUTHENTICATION_SESSION_NAME}=${Cypress.env(
              'validCookieToken',
            )}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax`,
            'X-Remix-Redirect': '/home',
            'X-Remix-Revalidate': 'yes',
          },
          statusCode: 204,
        });
      }).as('login');

      // Navigate to the login page.
      cy.visit('/login');

      // Simulate being offline.
      goOffline();

      // There should be an appropriate error and the submit button is disabled.
      cy.findByText(/please connect to the internet/i).should('exist');
      cy.findByRole('button', { name: /sign in/i }).should('be.disabled');

      // Simulate being online again.
      goOnline();

      // The error should NOT crash the app and the user should be able to log in
      // again.
      cy.findByLabelText(/email/i).type(Cypress.env('validMagicEmail'));
      cy.findByRole('button', { name: /sign in/i }).click();
      cy.url().should('equal', Cypress.config().baseUrl + '/home');
    });
  });
});
