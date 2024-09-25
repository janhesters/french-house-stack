import { describe, expect, test } from 'vitest';

import { enforceHttps } from './https';

describe('enforceHttps()', () => {
  test('given a request with a HTTP url: should redirect to HTTPS', () => {
    expect.assertions(2);

    const request = new Request('http://example.com', {
      headers: new Headers({
        'X-Forwarded-Proto': 'http',
      }),
    });

    try {
      enforceHttps(request);
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual('https://example.com/');
      }
    }
  });

  test('given a request with a HTTP url and query params: should redirect to HTTPS and keep params', () => {
    expect.assertions(2);

    const request = new Request('http://example.com?foo=bar', {
      headers: new Headers({
        'X-Forwarded-Proto': 'http',
      }),
    });

    try {
      enforceHttps(request);
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual(
          'https://example.com/?foo=bar',
        );
      }
    }
  });

  test('should not redirect if the request is already using HTTPS', () => {
    const request = new Request('https://example.com', {
      headers: new Headers({
        'X-Forwarded-Proto': 'https',
      }),
    });

    expect(() => enforceHttps(request)).not.toThrow();
  });

  test('should not redirect if the request is using localhost', () => {
    const request = new Request('http://localhost', {
      headers: new Headers({
        'X-Forwarded-Proto': 'http',
      }),
    });

    expect(() => enforceHttps(request)).not.toThrow();
  });
});
