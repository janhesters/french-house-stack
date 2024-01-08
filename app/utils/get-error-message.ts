type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    if (typeof maybeError === 'string') return new Error(maybeError);

    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

/**
 * Get the error message from an error or any other thing that has been thrown.
 *
 * @param error - Something that has been thrown and might be an error.
 * @returns A string containing the error message.
 *
 * @example
 *
 * Used on an Error instance:
 *
 * ```ts
 * getErrorMessage(new Error('Something went wrong'))
 * // ↵ 'Something went wrong'
 * ```
 *
 * Used on a non-error object:
 *
 * ```ts
 * getErrorMessage({ message: 'Something went wrong' })
 * // ↵ 'Something went wrong'
 * ```
 *
 * Used on a non-error object with no message property (e.g. a primitive):
 *
 * ```ts
 * getErrorMessage('Something went wrong')
 * // ↵ '"some-string"'
 * ```
 */
export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}
