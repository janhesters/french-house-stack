import { map } from 'ramda';
import type { output, ZodType } from 'zod';

import { asyncPipe } from './async-pipe';
import { badRequest } from './http-responses.server';

/**
 * Converts a Request object into FormData.
 *
 * @param request - The Request object to be converted.
 * @returns - A Promise that resolves to the FormData object.
 */
export const requestToFormData = (request: Request) => request.formData();

/**
 * Converts FormData into a plain object.
 *
 * @param formData - The FormData object to be converted.
 * @returns - The resulting object, where each key-value pair corresponds to a
 * field in the FormData.
 */
export const formDataToObject = (formData: FormData) =>
  Object.fromEntries(formData.entries());

/**
 * Validates an object against a Zod schema and handles any errors.
 *
 * This higher-order function takes a Zod schema as an argument and returns a
 * new function. The returned function accepts an object, which is typically the
 * output of `formDataToObject`, and validates this object against the provided
 * Zod schema. If the validation fails, it throws a BadRequest error with
 * detailed information about form-level and field-level errors. If the
 * validation succeeds, it returns the validated data.
 *
 * @typeParam Schema - A generic parameter that extends `ZodType`, representing
 * the schema against which the data will be validated.
 * @param schema - A Zod schema instance to validate the data against.
 * @returns A function that takes an object to validate and either throws a
 * BadRequest error or returns the validated data.
 */
export const validateFormData =
  <Schema extends ZodType>(schema: Schema) =>
  (values: ReturnType<typeof formDataToObject>): output<Schema> => {
    const result = schema.safeParse(values);

    if (!result.success) {
      const { formErrors, fieldErrors } = result.error.flatten();

      throw badRequest({
        errors: {
          ...(formErrors.length > 0 && {
            form: { message: formErrors[0], type: 'manual' },
          }),
          ...map(
            errors => ({ message: errors![0], type: 'manual' }),
            fieldErrors,
          ),
        },
      });
    }

    return result.data;
  };

/**
 * Converts a Request into FormData, then into a plain object, and
 * finally validates the object against a Zod schema.
 *
 * @param schema - The Zod schema to validate against.
 * @returns - A function that takes a Request and returns a Promise that
 * resolves to the result of the Zod schema's safeParse method.
 */
export const parseFormData = <Schema extends ZodType>(
  schema: Schema,
  request: Request,
) =>
  asyncPipe(
    requestToFormData,
    formDataToObject,
    validateFormData(schema),
  )(request);

/**
 * A middleware that validates the form data from a request against a provided
 * Zod schema.
 *
 * @param schema - The Zod schema to validate the form data against.
 * @param request - The request with form data to be parsed.
 * @returns The middleware object with the parsed form data.
 * @throws Will throw a 400 Bad Request error if the form data does not conform
 * to the schema with an  object containing the formatted error details.
 */
export const withValidatedFormData =
  <Schema extends ZodType>(schema: Schema) =>
  async <T extends { request: Request }>({ request, ...rest }: T) => ({
    request,
    ...rest,
    data: await parseFormData(schema, request),
  });
