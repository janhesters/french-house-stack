// @vitest-environment node
import { describe, expect, test } from 'vitest';

describe('login action', () => {
  test('given an authenticated request: redirects to the home page', () => {
    //
  });

  describe('email login intent', () => {
    const intent = 'emailLogin';

    test('given a valid email for an email without a user profile associated to it: returns the email', () => {
      //
    });

    test('given a valid email for an email with a user profile associated to it: throws a bad request with an appropriate form error', () => {
      //
    });

    test('given an invalid email: throws a bad request with an appropriate email error', () => {
      //
    });
  });

  describe('magic email login intent', () => {
    test('given an invalid DID token: throws a bad request with an appropriate DID token error', () => {
      //
    });

    test('given a valid DID token and the user profile does NOT exist: creates the user profile and redirects them to the organization creation onboarding page', () => {
      //
    });

    test('given a valid DID token and the user profile already exists, but the user has no organizations: logs the user in and redirects them to the organization creation onboarding page', () => {
      //
    });

    test("given a valid DID token and the user profile already exists and the user is a member of a single organization: redirects the user to that organization's home page", () => {
      //
    });

    test('given a valid DID token and the user profile already exists and the user is a member of multiple organizations: redirects the user to the organization selection page', () => {
      //
    });
  });

  describe('magic error intent', () => {
    test('given a form error: throws a bad request with an appropriate form error', () => {
      //
    });
  });
});
