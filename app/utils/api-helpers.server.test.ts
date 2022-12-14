import { describe } from 'vitest';

import { assert } from '~/test/assert';

import {
  badRequest,
  forbidden,
  internalServerError,
  notAllowed,
  notFound,
} from './api-helpers.server';

describe('badRequest()', async () => {
  {
    const response = badRequest();

    assert({
      given: 'no arguments',
      should: 'return a response with the 400 status code',
      actual: response.status,
      expected: 400,
    });

    assert({
      given: 'no arguments',
      should: 'return a response with the application/json content type',
      actual: response.headers.get('Content-Type'),
      expected: 'application/json; charset=utf-8',
    });

    const body = await response.json();

    assert({
      given: 'no arguments',
      should: 'return a response with a message',
      actual: body.message,
      expected: 'Bad Request',
    });

    assert({
      given: 'no arguments',
      should: 'return a response with no errors',
      actual: body.errors,
      expected: undefined,
    });
  }

  {
    // @ts-expect-error The typings for Zod are wrong.
    const response = badRequest({ _errors: ['Required'] });

    assert({
      given: 'some formatted Zod errors',
      should: 'return a response with the 400 status code',
      actual: response.status,
      expected: 400,
    });

    assert({
      given: 'some formatted Zod errors',
      should: 'return a response with the application/json content type',
      actual: response.headers.get('Content-Type'),
      expected: 'application/json; charset=utf-8',
    });

    const body = await response.json();

    assert({
      given: 'some formatted Zod errors',
      should: 'return a response with a message',
      actual: body.message,
      expected: 'Bad Request',
    });

    assert({
      given: 'some formatted Zod errors',
      should: 'return a response with the errors',
      actual: body.errors,
      expected: { _errors: ['Required'] },
    });
  }
});

describe('forbidden()', async () => {
  const response = forbidden();

  assert({
    given: 'no arguments',
    should: 'return a response with the 403 status code',
    actual: response.status,
    expected: 403,
  });

  assert({
    given: 'no arguments',
    should: 'return a response with the application/json content type',
    actual: response.headers.get('Content-Type'),
    expected: 'application/json; charset=utf-8',
  });

  const body = await response.json();

  assert({
    given: 'no arguments',
    should: 'return a response with a message',
    actual: body.message,
    expected: 'Forbidden',
  });
});

describe('notFound()', async () => {
  {
    const response = notFound();

    assert({
      given: 'no arguments',
      should: 'return a response with the 404 status code',
      actual: response.status,
      expected: 404,
    });

    assert({
      given: 'no arguments',
      should: 'return a response with the application/json content type',
      actual: response.headers.get('Content-Type'),
      expected: 'application/json; charset=utf-8',
    });

    const body = await response.json();

    assert({
      given: 'no arguments',
      should: 'return a response with a message',
      actual: body.message,
      expected: 'Not Found',
    });

    assert({
      given: 'no arguments',
      should: 'return a response with no errors',
      actual: body.errors,
      expected: undefined,
    });
  }

  {
    const response = notFound('Custom error message');

    assert({
      given: 'a custom error message',
      should: 'return a response with the 404 status code',
      actual: response.status,
      expected: 404,
    });

    assert({
      given: 'a custom error message',
      should: 'return a response with the application/json content type',
      actual: response.headers.get('Content-Type'),
      expected: 'application/json; charset=utf-8',
    });

    const body = await response.json();

    assert({
      given: 'a custom error message',
      should: 'return a response with a message',
      actual: body.message,
      expected: 'Not Found',
    });

    assert({
      given: 'a custom error message',
      should: 'return a response with the custom error message',
      actual: body.errors,
      expected: 'Custom error message',
    });
  }
});

describe('notAllowed()', async () => {
  const response = notAllowed();

  assert({
    given: 'no arguments',
    should: 'return a response with the 405 status code',
    actual: response.status,
    expected: 405,
  });

  assert({
    given: 'no arguments',
    should: 'return a response with the application/json content type',
    actual: response.headers.get('Content-Type'),
    expected: 'application/json; charset=utf-8',
  });

  const body = await response.json();

  assert({
    given: 'no arguments',
    should: 'return a response with a message',
    actual: body.message,
    expected: 'Method Not Allowed',
  });
});

describe('internalServerError()', async () => {
  const response = internalServerError();

  assert({
    given: 'no arguments',
    should: 'return a response with the 500 status code',
    actual: response.status,
    expected: 500,
  });

  assert({
    given: 'no arguments',
    should: 'return a response with the application/json content type',
    actual: response.headers.get('Content-Type'),
    expected: 'application/json; charset=utf-8',
  });

  const body = await response.json();

  assert({
    given: 'no arguments',
    should: 'return a response with a message',
    actual: body.message,
    expected: 'Internal Server Error',
  });
});
