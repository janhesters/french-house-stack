import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import { describe, expect, test } from 'vitest';

import type { ToastInput } from './toast.server';
import {
  createToastHeaders,
  getToast,
  redirectWithToast,
} from './toast.server';

/**
 * Converts a headers object with a 'Set-Cookie' header to a headers object
 * with a 'Cookie' header.
 *
 * NOTE: This is a helper function for testing purposes only. We need to convert
 * the 'Set-Cookie' header to a 'Cookie' header to mimic the behavior of the
 * real app.
 *
 * @param headers - A headers object with a 'Set-Cookie' header.
 * @returns A headers object with a 'Cookie' header.
 */
const mapHeaders = (headers: Headers) => {
  const cookie = headers.get('Set-Cookie');
  return cookie ? new Headers({ Cookie: cookie }) : undefined;
};

describe('getToast() & createToastHeaders()', () => {
  test('given a request with a toast message and only the mandatory properties: retrieves the correct toast message and provides defaults for the missing properties', async () => {
    const toastMessage = { description: faker.lorem.sentence() };
    const headers = await createToastHeaders(toastMessage);
    const request = new Request(faker.internet.url(), {
      headers: mapHeaders(headers),
    });

    const { toast: actual } = await getToast(request);
    const expected = {
      ...toastMessage,
      id: expect.any(String),
      type: 'message',
    };

    expect(actual).toMatchObject(expected);
  });

  test('given a request with a toast message and all properties: retrieves the correct toast message', async () => {
    const toastMessage: ToastInput = {
      description: faker.lorem.sentence(),
      id: createId(),
      title: faker.lorem.sentence(),
      type: 'error',
    };
    const headers = await createToastHeaders(toastMessage);
    const request = new Request(faker.internet.url(), {
      headers: mapHeaders(headers),
    });

    const { toast: actual } = await getToast(request);
    const expected = toastMessage;

    expect(actual).toMatchObject(expected);
  });

  test('given a request with a toast message: returns the correct headers for the session', async () => {
    const toastMessage = { description: faker.lorem.sentence() };
    const headers = await createToastHeaders(toastMessage);
    const request = new Request(faker.internet.url(), {
      headers: mapHeaders(headers),
    });

    const { headers: actual } = await getToast(request);
    const expected =
      '__toast=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax';

    expect(actual!.get('Set-Cookie')).toEqual(expected);
  });

  test('given a request without a toast message: returns null', async () => {
    const request = new Request(faker.internet.url());

    const actual = await getToast(request);
    const expected = { toast: null, headers: null };

    expect(actual).toEqual(expected);
  });
});

describe('redirectWithToast()', () => {
  test('given a URL and a toast message: returns a redirect response with toast headers', async () => {
    const url = faker.internet.url();
    const toastMessage: ToastInput = { description: faker.lorem.sentence() };

    const response = await redirectWithToast(url, toastMessage);

    expect(response.status).toEqual(302);
    expect(response.headers.get('Location')).toEqual(url);
    expect(response.headers.get('Set-Cookie')).toEqual(
      expect.stringContaining('__toast='),
    );
  });

  test('given a URL, a toast message, and additional headers: returns a redirect response with combined headers', async () => {
    const url = faker.internet.url();
    const toastMessage: ToastInput = { description: faker.lorem.sentence() };
    const additionalHeaders = new Headers({ 'X-Custom-Header': 'TestValue' });

    const response = await redirectWithToast(url, toastMessage, {
      headers: additionalHeaders,
    });

    expect(response.status).toEqual(302);
    expect(response.headers.get('Location')).toEqual(url);
    expect(response.headers.get('Set-Cookie')).toEqual(
      expect.stringContaining('__toast='),
    );
    expect(response.headers.get('X-Custom-Header')).toEqual('TestValue');
  });
});
