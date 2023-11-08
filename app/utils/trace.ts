import { tap } from 'ramda';

/**
 * A utility higher-order function that can be used with point-free style to log
 * the contents of a given value.
 *
 * @param message - The message to prefix the logged out value with.
 * @returns A function that takes in a value and returns it while logging out
 * the value with the given message.
 *
 * @example
 * ```ts
 * import { map } from 'ramda';
 *
 * const multiplyByTen = map(x => x * 10);
 * const subtractFive = map(x => x - 5);
 *
 * const traceProcess = pipe(
 *   multiplyByTen,
 *   trace('Value after multiplying by 10'),
 *   subtractFive
 * );
 *
 * console.log(traceProcess([1, 2, 3]));
 * // ↵ "Value after multiplying by 10: [10, 20, 30]"
 * ```
 */
export const trace: (message: string) => <T>(value: T) => T = message =>
  tap(x => console.log(message, x));
