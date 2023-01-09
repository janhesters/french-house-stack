/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';

import {
  getSearchParameterFromRequest,
  getSearchParameterFromUrl,
  requestToUrl,
} from './get-search-parameter-from-request';

describe('requestToUrl()', () => {
  test('given a request with a url: returns a URL object for it', () => {
    const url = 'https://www.mozilla.org/favicon.ico';

    expect(requestToUrl(new Request(url))).toEqual(new URL(url));
  });
});

describe('getSearchParameterFromUrl()', () => {
  test('given a url and a search parameter that is in the url: returns the value of the search parameter', () => {
    const searchParameter = 'redirectTo';
    const url = new URL(`https://example.com?${searchParameter}=home&foo=bar`);

    expect(getSearchParameterFromUrl(searchParameter)(url)).toEqual('home');
  });

  test('given a url and a search parameter that is NOT in the url: returns null', () => {
    const searchParameter = 'search';
    const url = new URL(`https://example.com?foo=bar`);

    expect(getSearchParameterFromUrl(searchParameter)(url)).toEqual(null);
  });
});

describe('getSearchParameterFromRequest()', () => {
  test('given a request and a search parameter that is in the request url: returns the value of the search parameter', () => {
    const searchParameter = 'redirectTo';
    const request = new Request(
      `https://example.com?${searchParameter}=home&foo=bar`,
    );

    expect(getSearchParameterFromRequest(searchParameter)(request)).toEqual(
      'home',
    );
  });

  test('given a request and a search parameter that is NOT in the request url: returns null', () => {
    const searchParameter = 'filterUsers';
    const request = new Request(`https://example.com?foo=bar`);

    expect(getSearchParameterFromRequest(searchParameter)(request)).toEqual(
      null,
    );
  });

  test("given a request and a search parameter that is in the request's url: returns the value of the search parameter", () => {
    const searchParameter = 'redirectTo';
    const request = new Request(
      `https://example.com?${searchParameter}=home&foo=bar`,
    );

    expect(getSearchParameterFromRequest(searchParameter)(request)).toEqual(
      'home',
    );
  });

  test("given a request and a search parameter that is NOT in the request's url: returns null", () => {
    const searchParameter = 'filterUsers';
    const request = new Request(`https://example.com?foo=bar`);

    expect(getSearchParameterFromRequest(searchParameter)(request)).toEqual(
      null,
    );
  });
});
