import type { TypedResponse } from '@remix-run/node';
import { json } from '@remix-run/node';

type NestedJSON = {
  [key: string]: unknown | NestedJSON;
};

/**
 * Returns a 201 Created success status response.
 *
 * @returns A response with the 201 status code and a message.
 */
export function created(): TypedResponse<{ message: string }>;
/**
 * Returns a 201 Created success status response.
 *
 * @param data - An object containing custom data for the response.
 * @returns A response with the 201 status code and the provided data.
 */
export function created<T extends NestedJSON>(
  data: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } & T>;
export function created<T extends NestedJSON>(
  data?: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } | ({ message: string } & T)> {
  return data
    ? json({ message: 'Created', ...data }, { ...init, status: 201 })
    : json({ message: 'Created' }, { ...init, status: 201 });
}

/**
 * Returns a 400 Bad Request error.
 *
 * @returns A response with the 400 status code and a message.
 */
export function badRequest(): TypedResponse<{ message: string }>;
/**
 * Returns a 400 Bad Request error.
 *
 * @param errors - An object containing custom error messages.
 * @returns A response with the 400 status code and the error messages.
 */
export function badRequest<T extends NestedJSON>(
  errors: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } & T>;
export function badRequest<T extends NestedJSON>(
  errors?: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } | ({ message: string } & T)> {
  return errors
    ? json({ message: 'Bad Request', ...errors }, { ...init, status: 400 })
    : json({ message: 'Bad Request' }, { status: 400 });
}

/**
 * Returns a 403 Unauthorized error.
 *
 * @returns A response with the 403 status code and a message.
 */
export function forbidden(): TypedResponse<{ message: string }>;
/**
 * Returns a 403 Unauthorized error.
 *
 * @param errors - An object containing custom error messages.
 * @returns A response with the 403 status code and the error messages.
 */
export function forbidden<T extends NestedJSON>(
  errors: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } & T>;
export function forbidden<T extends NestedJSON>(
  errors?: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } | ({ message: string } & T)> {
  return errors
    ? json({ message: 'Forbidden', ...errors }, { ...init, status: 403 })
    : json({ message: 'Forbidden' }, { status: 403 });
}

/**
 * Returns a 404 Not Found error.
 *
 * @returns A response with the 404 status code and a message.
 */
export function notFound(): TypedResponse<{ message: string }>;
/**
 * Returns a 404 Not Found error.
 *
 * @param errors - An object containing custom error messages.
 * @returns A response with the 404 status code and the error messages.
 */
export function notFound<T extends NestedJSON>(
  errors: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } & T>;
export function notFound<T extends NestedJSON>(
  errors?: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } | ({ message: string } & T)> {
  return errors
    ? json({ message: 'Not Found', ...errors }, { ...init, status: 404 })
    : json({ message: 'Not Found' }, { status: 404 });
}

/**
 * Returns a 405 Method Not Allowed error.
 *
 * @returns A response with the 405 status code and a message.
 */
export function notAllowed(): TypedResponse<{ message: string }>;
/**
 * Returns a 405 Method Not Allowed error.
 *
 * @param errors - An object containing custom error messages.
 * @returns A response with the 405 status code and the error messages.
 */
export function notAllowed<T extends NestedJSON>(
  errors: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } & T>;
export function notAllowed<T extends NestedJSON>(
  errors?: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } | ({ message: string } & T)> {
  return errors
    ? json(
        { message: 'Method Not Allowed', ...errors },
        { ...init, status: 405 },
      )
    : json({ message: 'Method Not Allowed' }, { status: 405 });
}

/**
 * Returns a 409 Conflict error.
 *
 * @returns A response with the 409 status code and a message.
 */
export function conflict(): TypedResponse<{ message: string }>;
/**
 * Returns a 409 Conflict error.
 *
 * @param errors - An object containing custom error messages.
 * @returns A response with the 409 status code and the error messages.
 */
export function conflict<T extends NestedJSON>(
  errors: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } & T>;
export function conflict<T extends NestedJSON>(
  errors?: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } | ({ message: string } & T)> {
  return errors
    ? json({ message: 'Conflict', ...errors }, { ...init, status: 409 })
    : json({ message: 'Conflict' }, { status: 409 });
}

/**
 * Returns a 422 Unprocessable Entity error.
 *
 * @returns A response with the 422 status code and a message.
 */
export function unprocessableEntity(): TypedResponse<{ message: string }>;
/**
 * Returns a 422 Unprocessable Entity error.
 *
 * @param errors - An object containing custom error messages.
 * @returns A response with the 422 status code and the error messages.
 */
export function unprocessableEntity<T extends NestedJSON>(
  errors: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } & T>;
export function unprocessableEntity<T extends NestedJSON>(
  errors?: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } | ({ message: string } & T)> {
  return errors
    ? json(
        { message: 'Unprocessable Entity', ...errors },
        { ...init, status: 422 },
      )
    : json({ message: 'Unprocessable Entity' }, { status: 422 });
}

/**
 * Returns a 500 Internal Server Error.
 *
 * @returns A response with the 500 status code and a message.
 */
export function internalServerError(): TypedResponse<{ message: string }>;
/**
 * Returns a 500 Internal Server Error.
 *
 * @param errors - An object containing custom error messages.
 * @returns A response with the 500 status code and the error messages.
 */
export function internalServerError<T extends NestedJSON>(
  errors: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } & T>;
export function internalServerError<T extends NestedJSON>(
  errors?: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } | ({ message: string } & T)> {
  return errors
    ? json(
        { message: 'Internal Server Error', ...errors },
        { ...init, status: 500 },
      )
    : json({ message: 'Internal Server Error' }, { status: 500 });
}

/**
 * Returns a 502 Bad Gateway error.
 *
 * @returns A response with the 502 status code and a message.
 */
export function badGateway(): TypedResponse<{ message: string }>;
/**
 * Returns a 502 Bad Gateway error.
 *
 * @param errors - An object containing custom error messages.
 * @returns A response with the 502 status code and the error messages.
 */
export function badGateway<T extends NestedJSON>(
  errors: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } & T>;
export function badGateway<T extends NestedJSON>(
  errors?: T,
  init?: Omit<ResponseInit, 'status'>,
): TypedResponse<{ message: string } | ({ message: string } & T)> {
  return errors
    ? json({ message: 'Bad Gateway', ...errors }, { ...init, status: 502 })
    : json({ message: 'Bad Gateway' }, { status: 502 });
}
