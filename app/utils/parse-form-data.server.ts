import type { Submission } from '@conform-to/dom';
import { parse } from '@conform-to/zod';
import { badRequest } from 'remix-utils';
import type { output, ZodErrorMap, ZodTypeAny } from 'zod';

import { asyncPipe } from './async-pipe';

const toFormData = (request: Request) => request.formData();

type ParseConfig<Schema extends ZodTypeAny> = {
  schema: Schema | ((intent: string) => Schema);
  acceptMultipleErrors?: ({
    name,
    intent,
    payload,
  }: {
    name: string;
    intent: string;
    payload: Record<string, any>;
  }) => boolean;
  async?: boolean;
  errorMap?: ZodErrorMap;
};

const parseFormData =
  <Schema extends ZodTypeAny>(config: ParseConfig<Schema>) =>
  (formData: FormData) =>
    // @ts-expect-error `async` can be undefined, true, or false, but since the
    // types of `parse` are overloaded, TS complains when `async` is undefined.
    parse(formData, config);

const throwIfInvalid = <Schema extends ZodTypeAny>(
  submission: Submission<output<Schema>>,
) => {
  if (!submission.value || submission.intent !== 'submit') {
    return badRequest(submission);
  }

  return submission;
};

const validateFormData = <Schema extends ZodTypeAny>(
  config: ParseConfig<Schema>,
) => asyncPipe(toFormData, parseFormData(config), throwIfInvalid);

export const withValidatedFormData =
  <Schema extends ZodTypeAny>(config: ParseConfig<Schema>) =>
  async <T extends { request: Request }>(middleware: T) =>
    Object.assign(middleware, {
      submission: await validateFormData(config)(middleware.request),
    });
