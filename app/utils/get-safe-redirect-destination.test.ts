import { describe, expect, it } from 'vitest';

import getSafeRedirectDestination, {
  getRedirectToSearchParameter,
  isValidRedirectDestination,
  requestToUrl,
} from './get-safe-redirect-destination';

describe('getRedirectToSearchParameter()', () => {
  it('given a URL object with a url with a redirect to search param returns the value', () => {
    const value = '/home';
    const url = new URL(`https://example.com?redirectTo=${value}`);

    const actual = getRedirectToSearchParameter(url);
    const expected = value;

    expect(actual).toEqual(expected);
  });
});

describe('isValidRedirectDestination()', () => {
  it('given a valid redirect destination returns the redirect destination', () => {
    const actual = isValidRedirectDestination('/notes');
    const expected = true;

    expect(actual).toEqual(expected);
  });

  it("given no redirect destination and no default redirect destination returns '/' as the default redirect destination", () => {
    // eslint-disable-next-line unicorn/no-null
    const actual = isValidRedirectDestination(null);
    const expected = false;

    expect(actual).toEqual(expected);
  });

  it.each([[new File([], 'foo')], ['home'], ['//home']])(
    'given an invalid redirect destination (e.g. a file) returns the default redirect destination',
    invalidDestination => {
      const actual = isValidRedirectDestination(invalidDestination);
      const expected = false;

      expect(actual).toEqual(expected);
    },
  );
});

describe('requestToUrl()', () => {
  it('given a request with a url returns a URL object for it', () => {
    const url = 'https://www.mozilla.org/favicon.ico';

    const actual = requestToUrl(new Request(url));
    const expected = new URL(url);

    expect(actual).toEqual(expected);
  });
});

describe('getSafeRedirectDestination()', () => {
  it('given a request with a url returns the safe redirect destination', () => {
    const destination = '/profile';
    const request = new Request(
      `http://localhost:3000?redirectTo=${destination}`,
    );

    const actual = getSafeRedirectDestination(request);
    const expected = destination;

    expect(actual).toEqual(expected);
  });
});
