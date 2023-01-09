import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import {
  badRequest,
  forbidden,
  internalServerError,
  notAllowed,
  notFound,
} from './api-helpers.server';

describe('badRequest()', async () => {
  test('given no arguments: returns a 400 status with a message', async () => {
    const response = badRequest();

    expect(response.status).toEqual(400);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({ message: 'Bad Request' });
  });

  test('given some formatted Zod errors: returns a 400 status with the errors and a message', async () => {
    // @ts-expect-error The typings for Zod are wrong.
    const response = badRequest({ _errors: ['Required'] });

    expect(response.status).toEqual(400);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Bad Request',
      errors: { _errors: ['Required'] },
    });
  });
});

describe('forbidden', () => {
  test('given no arguments: returns a 403 status with a message', async () => {
    const response = forbidden();

    expect(response.status).toEqual(403);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({ message: 'Forbidden' });
  });
});

describe('notFound()', () => {
  test('given no arguments: returns a 404 status with a message', async () => {
    const response = notFound();

    expect(response.status).toEqual(404);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({ message: 'Not Found' });
  });

  test('given a custom error message: returns a 404 status with the custom error message', async () => {
    const message = faker.lorem.words();
    const response = notFound(message);

    expect(response.status).toEqual(404);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Not Found',
      errors: message,
    });
  });
});

describe('notAllowed()', () => {
  test('given no arguments: returns a 405 status with a message', async () => {
    const response = notAllowed();

    expect(response.status).toEqual(405);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({ message: 'Method Not Allowed' });
  });
});

describe('internalServerError()', () => {
  test('given no arguments: returns a 500 status with a message', async () => {
    const response = internalServerError();

    expect(response.status).toEqual(500);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({ message: 'Internal Server Error' });
  });
});
