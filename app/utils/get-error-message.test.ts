/* eslint-disable jest/no-conditional-expect */
import { describe, expect, it } from 'vitest';

import getErrorMessage from './get-error-message';

describe('getErrorMessage()', () => {
  it("given an error returns the error's message", () => {
    const message = 'foo';
    const error = new Error(message);

    const actual = getErrorMessage(error);
    const expected = message;

    expect(actual).toEqual(expected);
  });

  it("given a string is thrown return's the string", () => {
    expect.assertions(1);

    const someString = 'some-string';

    try {
      throw someString;
    } catch (error) {
      const actual = getErrorMessage(error);
      const expected = JSON.stringify(someString);

      expect(actual).toEqual(expected);
    }
  });

  it("given a number is thrown return's the number", () => {
    expect.assertions(1);

    const someNumber = 1;

    try {
      throw someNumber;
    } catch (error) {
      const actual = getErrorMessage(error);
      const expected = JSON.stringify(someNumber);

      expect(actual).toEqual(expected);
    }
  });

  it("given extending the custom error class should return the error's message", () => {
    class CustomError extends Error {
      public constructor(message: string) {
        super(message);
      }
    }

    const message = 'bar';
    const error = new CustomError(message);

    const actual = getErrorMessage(error);
    const expected = message;

    expect(actual).toEqual(expected);
  });

  it("given a custom error object should return the error's message", () => {
    const message = 'baz';
    const error = { message };

    const actual = getErrorMessage(error);
    const expected = message;

    expect(actual).toEqual(expected);
  });

  it('handles circular references', () => {
    expect.assertions(1);

    const object = { circular: this };

    try {
      throw object;
    } catch (error) {
      const actual = getErrorMessage(error);
      const expected = '[object Object]';

      expect(actual).toEqual(expected);
    }
  });
});
