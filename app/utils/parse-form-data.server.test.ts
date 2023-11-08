import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import {
  formDataToObject,
  parseFormData,
  requestToFormData,
  validateFormData,
  withValidatedFormData,
} from './parse-form-data.server';
import { toFormData } from './to-form-data';

describe('requestToFormData()', () => {
  test('given a request: returns its form data', async () => {
    const formData = toFormData({ text: 'Hello' });
    const request = new Request(faker.internet.url(), {
      method: 'POST',
      body: formData,
    });

    const actual = await requestToFormData(request);
    const expected = formData;

    expect(actual).toEqual(expected);
  });
});

describe('formDataToObject()', () => {
  test('given form data: converts it to an object', () => {
    const formData = toFormData({ text: 'Hello' });

    const actual = formDataToObject(formData);
    const expected = { text: 'Hello' };

    expect(actual).toEqual(expected);
  });
});

describe('validateFormData()', () => {
  test('given a schema and valid data: returns the data', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.coerce.number().int().min(18),
    });
    const values = { email: 'test@example.com', age: '18' };

    const actual = validateFormData(schema)(values);
    const expected = { email: 'test@example.com', age: 18 };

    expect(actual).toEqual(expected);
  });

  test('given a schema with one invalid value, the rest are valid: throws a bad request response with all errors for the invalid field in an error object', async () => {
    expect.assertions(1);

    const schema = z.object({
      email: z.string().email(),
      age: z.coerce.number().int().min(18),
    });
    const values = { email: 'not-an-email', age: '18' };

    try {
      validateFormData(schema)(values);
    } catch (error) {
      if (error instanceof Response) {
        const actual = await error.json();
        const expected = {
          errors: { email: { message: 'Invalid email', type: 'manual' } },
          message: 'Bad Request',
        };

        expect(actual).toEqual(expected);
      }
    }
  });

  test('given a schema and invalid values: throws a bad request response with the first of each error in an error object', async () => {
    expect.assertions(1);

    const schema = z.object({
      email: z.string().email('invalid-email'),
      age: z.coerce
        .number({ invalid_type_error: 'age-must-be-number' })
        .int('age-must-be-int')
        .min(18, 'minimum-age-is-18'),
    });
    const values = { email: 'not-an-email', age: '17.5' };

    try {
      validateFormData(schema)(values);
    } catch (error) {
      if (error instanceof Response) {
        const actual = await error.json();
        const expected = {
          errors: {
            age: { message: 'age-must-be-int', type: 'manual' },
            email: { message: 'invalid-email', type: 'manual' },
          },
          message: 'Bad Request',
        };

        expect(actual).toEqual(expected);
      }
    }
  });

  test('given a violation of the root schema: throws a bad request response a form errors', async () => {
    expect.assertions(1);

    const schema = z.object({
      email: z.string().email(),
      age: z.number().int().min(18),
    });

    try {
      validateFormData(schema)(null as unknown as any);
    } catch (error) {
      if (error instanceof Response) {
        const actual = await error.json();
        const expected = {
          errors: {
            form: { message: 'Expected object, received null', type: 'manual' },
          },
          message: 'Bad Request',
        };

        expect(actual).toEqual(expected);
      }
    }
  });

  test('given a discriminated union and valid values: returns the data', () => {
    const schema = z.discriminatedUnion('type', [
      z.object({ type: z.literal('A'), a: z.string() }),
      z.object({ type: z.literal('B'), b: z.number() }),
    ]);
    const values = { type: 'A', a: 'Hello' };

    const actual = validateFormData(schema)(values);
    const expected = { type: 'A', a: 'Hello' };

    expect(actual).toEqual(expected);
  });
});

describe('parseFormData()', () => {
  test("given Zod schema and a request: validates the request's form data against the Zod schema", async () => {
    const schema = z.object({ text: z.string() });
    const values = { text: 'Hello' };
    const formData = toFormData(values);
    const request = new Request(faker.internet.url(), {
      method: 'POST',
      body: formData,
    });

    const actual = await parseFormData(schema, request);
    const expected = values;

    expect(actual).toEqual(expected);
  });
});

describe('withValidatedFormData()', () => {
  test('given Zod schema and a request: validates the request form data against the Zod schema', async () => {
    const schema = z.object({ text: z.string() });
    const values = { text: 'Hello' };
    const formData = toFormData(values);
    const request = new Request(faker.internet.url(), {
      method: 'POST',
      body: formData,
    });
    const middleware = withValidatedFormData(schema);

    const actual = await middleware({ request, foo: 'bar' });
    const expected = { request, foo: 'bar', data: values };

    expect(actual).toEqual(expected);
  });
});
