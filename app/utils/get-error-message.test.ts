/* eslint-disable jest/no-conditional-expect */
import { describe, expect, it } from 'vitest';

import { assert } from '~/test/assert';

import getErrorMessage from './get-error-message';

describe('getErrorMessage()', () => {
  {
    const message = 'This is an error message';

    assert({
      given: 'an error',
      should: "return the error's message",
      actual: getErrorMessage(new Error(message)),
      expected: message,
    });
  }

  it('given a string is thrown: returns the string', () => {
    expect.assertions(1);

    const someString = 'foo';

    try {
      throw someString;
    } catch (error) {
      const actual = getErrorMessage(error);
      const expected = JSON.stringify(someString);

      expect(actual).toEqual(expected);
    }
  });

  it('given a number is thrown: returns the number', () => {
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

  {
    class CustomError extends Error {
      public constructor(message: string) {
        super(message);
      }
    }

    const message = 'bar';

    assert({
      given: 'an error that extended the custom error class',
      should: "return the error's message",
      actual: getErrorMessage(new CustomError(message)),
      expected: message,
    });
  }

  {
    const message = 'baz';

    assert({
      given: 'a custom error object with a message property',
      should: "return the object's message property",
      actual: getErrorMessage({ message }),
      expected: message,
    });
  }

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
