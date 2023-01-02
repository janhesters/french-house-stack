import type { TypedResponse } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { ZodFormattedError } from 'zod';

/**
 * Returns a 400 Bad Request error.
 *
 * @returns A response with the 400 status code and a message.
 */
export function badRequest(): TypedResponse<{ message: string }>;
/**
 * Returns a 400 Bad Request error.
 *
 * @param errors - An object containing the errors from the Zod schema.
 * @returns A response with the 400 status code, a message and the errors.
 */
export function badRequest<T>(
  errors?: ZodFormattedError<T>,
): TypedResponse<{ message: string; errors: ZodFormattedError<T> }>;
/**
 * Returns a 400 Bad Request error.
 *
 * @param errors - A string containing the errors.
 * @returns A response with the 400 status code, a message and the errors.
 */
export function badRequest(
  errors?: string,
): TypedResponse<{ message: string; errors: string }>;
export function badRequest<T>(
  errors?: ZodFormattedError<T> | string,
): TypedResponse<{ message: string; errors?: ZodFormattedError<T> | string }> {
  return json(
    { message: 'Bad Request', ...(errors && { errors }) },
    { status: 400 },
  );
}

/**
 * Returns a 403 Unauthorized error.
 *
 * @returns A response with the 403 status code and a message.
 */
export function forbidden(): TypedResponse<{ message: string }> {
  return json({ message: 'Forbidden' }, { status: 403 });
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
 * @param errors - A string for a custom message.
 * @returns A response with the 404 status code, a message and the errors.
 */
export function notFound(
  errors: string,
): TypedResponse<{ message: string; errors: string }>;
export function notFound(errors?: string) {
  return json(
    { message: 'Not Found', ...(errors && { errors }) },
    { status: 404 },
  );
}

/**
 * Returns a 405 Method Not Allowed error.
 *
 * @returns A response with the 405 status code and a message.
 */
export const notAllowed = () =>
  json({ message: 'Method Not Allowed' }, { status: 405 });

/**
 * Returns a 500 Internal Server Error error.
 *
 * @returns A response with the 500 status code and a message.
 */
export function internalServerError(): TypedResponse<{ message: string }>;
/**
 * Returns a 500 Internal Server Error error.
 *
 * @param errors - A string for a custom message.
 * @returns A response with the 500 status code and a message.
 */
export function internalServerError(
  errors: string,
): TypedResponse<{ message: string }>;
export function internalServerError(
  errors?: string,
): TypedResponse<{ message: string }> {
  return json(
    { message: 'Internal Server Error', ...(errors && { errors }) },
    { status: 500 },
  );
}
