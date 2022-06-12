// Hack: This lives in a separate file, so we can import it in our Cypress.
// tests Importing from `user-authentication-session.ts` breaks Cypress'
// commands because we're importing stuff that requires Node.js.
// This is an anti-pattern. Usually constants should live in the file they're
// primarily used in and be imported in the others that share the same constant.
export const USER_AUTHENTICATION_SESSION_NAME = '__user-authentication-session';
