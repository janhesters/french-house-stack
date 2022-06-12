import { USER_AUTHENTICATION_SESSION_NAME } from '~/features/user-authentication/user-authentication-constants.server';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs the user session in by adding a session cookie.
       * Yields the user session and adds an alias to the user session.
       *
       * @returns {typeof loginByCookie}
       * @memberof Chainable
       * @example
       *    cy.loginByCookie()
       * @example
       *    cy.loginByCookie({ email: 'whatever@example.com', id: 'foo' })
       */
      loginByCookie: typeof loginByCookie;
    }
  }
}

function loginByCookie({
  id = 'did:ethr:0x701EF1ee4a2eC4f823D58C116fb5Fb50311477A1',
  email = 'bob@french-house-stack.com',
} = {}) {
  const user = { id, email };

  return cy.task<string>('createUserSession', id).then(token => {
    return cy.setCookie(USER_AUTHENTICATION_SESSION_NAME, token).then(() => {
      return user;
    });
  });
}

Cypress.Commands.add('loginByCookie', loginByCookie);
