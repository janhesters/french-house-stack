/* eslint-disable unicorn/no-null */
import { describe } from 'vitest';

import { assert } from '~/test/assert';

import {
  getSearchParameterFromRequest,
  getSearchParameterFromUrl,
  requestToUrl,
} from './get-search-parameter-from-request';

describe('requestToUrl()', () => {
  const url = 'https://www.mozilla.org/favicon.ico';

  assert({
    given: 'a request with a url',
    should: 'return a URL object for it',
    actual: requestToUrl(new Request(url)),
    expected: new URL(url),
  });
});

describe('getSearchParameterFromUrl()', () => {
  {
    const searchParameter = 'redirectTo';
    const url = new URL(`https://example.com?${searchParameter}=home&foo=bar`);

    assert({
      given:
        "a url and a search parameter that is in the url's search parameters",
      should: 'return the value of the search parameter',
      actual: getSearchParameterFromUrl(searchParameter)(url),
      expected: 'home',
    });
  }

  {
    const searchParameter = 'search';
    const url = new URL(`https://example.com?foo=bar`);

    assert({
      given: 'a url and a search that is NOT in the url',
      should: 'return null',
      actual: getSearchParameterFromUrl(searchParameter)(url),
      expected: null,
    });
  }
});

describe('getSearchParameterFromRequest()', () => {
  {
    const searchParameter = 'redirectTo';
    const request = new Request(
      `https://example.com?${searchParameter}=home&foo=bar`,
    );

    assert({
      given: "a request and a search parameter that is in the request's url",
      should: 'return the value of the search parameter',
      actual: getSearchParameterFromRequest(searchParameter)(request),
      expected: 'home',
    });
  }

  {
    const searchParameter = 'filterUsers';
    const request = new Request(`https://example.com?foo=bar`);

    assert({
      given:
        "a request and a search parameter that is NOT in the request's url",
      should: 'return null',
      actual: getSearchParameterFromRequest(searchParameter)(request),
      expected: null,
    });
  }
});
