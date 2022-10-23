import { expect } from 'vitest';

interface Assertion<T> {
  /**
   * Prose description of what is `given` to the component under test.
   */
  readonly given: string;
  /**
   * Prose description of what the actual result of calling the component with
   * the given arguments `should` be.
   */
  readonly should: string;
  /**
   * The actual result in the code by calling the component.
   */
  readonly actual: T;
  /**
   * The expected result in the code.
   */
  readonly expected: T;
}

/**
 * An assertion function that forces you to answer the [5 questions every unit
 * test must answer](https://medium.com/javascript-scene/what-every-unit-test-needs-f6cd34d9836d).
 *
 * @param assertion - Prose descriptions for `given` and `should`, as well as
 * `actual` and `expected` to perform a deep equality check.
 *
 * @see https://github.com/paralleldrive/riteway
 * @see https://medium.com/javascript-scene/what-every-unit-test-needs-f6cd34d9836d
 */
export function assert<T>(assertion: Assertion<T>) {
  expect(
    assertion.actual,
    `given ${assertion.given}: should ${assertion.should}`,
  ).toEqual(assertion.expected);
}
