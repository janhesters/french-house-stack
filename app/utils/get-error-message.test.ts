/* eslint-disable jest/no-conditional-expect */
import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { getErrorMessage } from './get-error-message';

describe('getErrorMessage()', () => {
  test("given an error: returns the error's message", () => {
    const message = faker.random.words();

    expect(getErrorMessage(new Error(message))).toEqual(message);
  });

  test('given a string is thrown: returns the string', () => {
    expect.assertions(1);

    const someString = faker.random.words();

    try {
      throw someString;
    } catch (error) {
      expect(getErrorMessage(error)).toEqual(JSON.stringify(someString));
    }
  });

  test('given a number is thrown: returns the number', () => {
    expect.assertions(1);

    const someNumber = 1;

    try {
      throw someNumber;
    } catch (error) {
      expect(getErrorMessage(error)).toEqual(JSON.stringify(someNumber));
    }
  });

  test("given an error that extended the custom error class: returns the error's message", () => {
    class CustomError extends Error {
      public constructor(message: string) {
        super(message);
      }
    }

    const message = faker.random.words();

    expect(getErrorMessage(new CustomError(message))).toEqual(message);
  });

  test("given a custom error object with a message property: returns the object's message property", () => {
    const message = faker.random.words();

    expect(getErrorMessage({ message })).toEqual(message);
  });

  it('given circular references: handles them', () => {
    expect.assertions(1);

    const object = { circular: this };

    try {
      throw object;
    } catch (error) {
      expect(getErrorMessage(error)).toEqual('[object Object]');
    }
  });
});
