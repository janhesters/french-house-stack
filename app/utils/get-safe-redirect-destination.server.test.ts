/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';

import {
  getSafeRedirectDestination,
  isValidRedirectDestination,
} from './get-safe-redirect-destination.server';

describe('isValidRedirectDestination()', () => {
  test('given a valid redirect destination: returns the redirect destination', () => {
    expect(isValidRedirectDestination('/notes')).toEqual(true);
  });

  test('given no redirect destination and no default redirect destination: returns false', () => {
    expect(isValidRedirectDestination(null)).toEqual(false);
  });

  test.each([new File([], 'foo'), 'home', '//home'])(
    `given an invalid redirect destination (e.g. a file): returns false`,
    invalidDestination => {
      expect(isValidRedirectDestination(invalidDestination)).toEqual(false);
    },
  );
});

describe('getSafeRedirectDestination()', () => {
  test('given a request with a url: returns the safe redirect destination', () => {
    const destination = '/profile';
    const request = new Request(
      `http://localhost:3000?redirectTo=${destination}`,
    );

    expect(getSafeRedirectDestination(request)).toEqual(destination);
  });
});
