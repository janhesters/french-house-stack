import { tap } from 'ramda';

/**
 * A utility function that can be used with point-free style to log the contents
 * of a given value.
 *
 * @param message - The message to prefix the logged out value with.
 * @returns A function that takes in a value and returns it while logging out
 * the value with the given message.
 */
const trace: (message: string) => <T>(value: T) => T = message =>
  tap(x => console.log(message, x));

export default trace;
