// @vitest-environment node
import { describe, expect, test } from 'vitest';

import {
  badGateway,
  badRequest,
  conflict,
  forbidden,
  internalServerError,
  notAllowed,
  notFound,
  unprocessableEntity,
} from './http-responses.server';

describe('badRequest()', () => {
  test('given no arguments: returns a 400 status with a message', async () => {
    const response = badRequest();

    expect(response.status).toEqual(400);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({ message: 'Bad Request' });
  });

  test('given a custom error object: returns a 400 status with the custom error object', async () => {
    const customErrors = { input: 'invalid-input' };
    const response = badRequest(customErrors);

    expect(response.status).toEqual(400);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Bad Request',
      ...customErrors,
    });
  });
});

describe('forbidden()', () => {
  test('given no arguments: returns a 403 status with a message', async () => {
    const response = forbidden();

    expect(response.status).toEqual(403);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({ message: 'Forbidden' });
  });

  test('given a custom error object: returns a 403 status with the custom error object', async () => {
    const customErrors = { access: 'insufficient-permissions' };
    const response = forbidden(customErrors);

    expect(response.status).toEqual(403);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Forbidden',
      ...customErrors,
    });
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

  test('given a custom error object: returns a 404 status with the custom error object', async () => {
    const customErrors = { resource: 'resource-not-found' };
    const response = notFound(customErrors);

    expect(response.status).toEqual(404);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Not Found',
      ...customErrors,
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

  test('given a custom error object: returns a 405 status with the custom error object', async () => {
    const customErrors = { method: 'invalid-method' };
    const response = notAllowed(customErrors);

    expect(response.status).toEqual(405);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Method Not Allowed',
      ...customErrors,
    });
  });
});

describe('conflict()', () => {
  test('given no arguments: returns a 409 status with a message', async () => {
    const response = conflict();

    expect(response.status).toEqual(409);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({ message: 'Conflict' });
  });

  test('given a custom error object: returns a 409 status with the custom error object', async () => {
    const customErrors = { questionText: 'question-text-already-exists' };
    const response = conflict(customErrors);

    expect(response.status).toEqual(409);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Conflict',
      ...customErrors,
    });
  });
});

describe('unprocessableEntity()', () => {
  test('given no arguments: returns a 422 status with a message', async () => {
    const response = unprocessableEntity();

    expect(response.status).toEqual(422);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({ message: 'Unprocessable Entity' });
  });

  test('given a custom error object: returns a 422 status with the custom error object', async () => {
    const customErrors = { field: 'unprocessable-error' };
    const response = unprocessableEntity(customErrors);

    expect(response.status).toEqual(422);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Unprocessable Entity',
      ...customErrors,
    });
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

  test('given a custom error object: returns a 500 status with the custom error object', async () => {
    const customErrors = { database: 'database-connection-failed' };
    const response = internalServerError(customErrors);

    expect(response.status).toEqual(500);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Internal Server Error',
      ...customErrors,
    });
  });
});

describe('badGateway()', () => {
  test('given no arguments: returns a 502 status with a message', async () => {
    const response = badGateway();

    expect(response.status).toEqual(502);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({ message: 'Bad Gateway' });
  });

  test('given a custom error object: returns a 502 status with the custom error object', async () => {
    const customErrors = { service: 'service-unavailable' };
    const response = badGateway(customErrors);

    expect(response.status).toEqual(502);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Bad Gateway',
      ...customErrors,
    });
  });
});
