import { describe, expect, test } from 'vitest';

import {
  badGateway,
  badRequest,
  conflict,
  created,
  forbidden,
  internalServerError,
  notAllowed,
  notFound,
  unprocessableEntity,
} from './http-responses.server';

describe('created()', () => {
  test('given no arguments: returns a 201 status with a message', async () => {
    const response = created();

    expect(response.status).toEqual(201);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({ message: 'Created' });
  });

  test('given a custom data object: returns a 201 status with the custom data object', async () => {
    const customData = { key: 'value' };
    const response = created(customData);

    expect(response.status).toEqual(201);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Created',
      ...customData,
    });
  });

  test('given a custom data and headers: returns a 201 status with the custom data and the headers', async () => {
    const headers = new Headers({ 'X-Custom-Header': 'TestValue' });
    const customData = { key: 'value' };
    const response = created(customData, { headers });

    expect(response.status).toEqual(201);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Created',
      ...customData,
    });
    expect(response.headers.get('X-Custom-Header')).toEqual('TestValue');
  });
});

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

  test('given a custom data and headers: returns a 400 status with the custom data and the headers', async () => {
    const headers = new Headers({ 'X-Custom-Header': 'TestValue' });
    const customErrors = { input: 'invalid-input' };
    const response = badRequest(customErrors, { headers });

    expect(response.status).toEqual(400);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Bad Request',
      ...customErrors,
    });
    expect(response.headers.get('X-Custom-Header')).toEqual('TestValue');
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

  test('given a custom error object and headers: returns a 403 status with the custom error object and the headers', async () => {
    const headers = new Headers({ 'X-Custom-Header': 'TestValue' });
    const customErrors = { access: 'insufficient-permissions' };
    const response = forbidden(customErrors, { headers });

    expect(response.status).toEqual(403);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Forbidden',
      ...customErrors,
    });
    expect(response.headers.get('X-Custom-Header')).toEqual('TestValue');
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

  test('given a custom error object and headers: returns a 404 status with the custom error object and the headers', async () => {
    const headers = new Headers({ 'X-Custom-Header': 'TestValue' });
    const customErrors = { resource: 'resource-not-found' };
    const response = notFound(customErrors, { headers });

    expect(response.status).toEqual(404);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Not Found',
      ...customErrors,
    });
    expect(response.headers.get('X-Custom-Header')).toEqual('TestValue');
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

  test('given a custom error object and headers: returns a 405 status with the custom error object and the headers', async () => {
    const headers = new Headers({ 'X-Custom-Header': 'TestValue' });
    const customErrors = { method: 'invalid-method' };
    const response = notAllowed(customErrors, { headers });

    expect(response.status).toEqual(405);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Method Not Allowed',
      ...customErrors,
    });
    expect(response.headers.get('X-Custom-Header')).toEqual('TestValue');
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

  test('given a custom error object and headers: returns a 409 status with the custom error object and the headers', async () => {
    const headers = new Headers({ 'X-Custom-Header': 'TestValue' });
    const customErrors = { questionText: 'question-text-already-exists' };
    const response = conflict(customErrors, { headers });

    expect(response.status).toEqual(409);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Conflict',
      ...customErrors,
    });
    expect(response.headers.get('X-Custom-Header')).toEqual('TestValue');
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

  test('given a custom error object and headers: returns a 422 status with the custom error object and the headers', async () => {
    const headers = new Headers({ 'X-Custom-Header': 'TestValue' });
    const customErrors = { field: 'unprocessable-error' };
    const response = unprocessableEntity(customErrors, { headers });

    expect(response.status).toEqual(422);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Unprocessable Entity',
      ...customErrors,
    });
    expect(response.headers.get('X-Custom-Header')).toEqual('TestValue');
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

  test('given a custom error object and headers: returns a 500 status with the custom error object and the headers', async () => {
    const headers = new Headers({ 'X-Custom-Header': 'TestValue' });
    const customErrors = { database: 'database-connection-failed' };
    const response = internalServerError(customErrors, { headers });

    expect(response.status).toEqual(500);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Internal Server Error',
      ...customErrors,
    });
    expect(response.headers.get('X-Custom-Header')).toEqual('TestValue');
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

  test('given a custom error object and headers: returns a 502 status with the custom error object and the headers', async () => {
    const headers = new Headers({ 'X-Custom-Header': 'TestValue' });
    const customErrors = { service: 'service-unavailable' };
    const response = badGateway(customErrors, { headers });

    expect(response.status).toEqual(502);
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      message: 'Bad Gateway',
      ...customErrors,
    });
    expect(response.headers.get('X-Custom-Header')).toEqual('TestValue');
  });
});
