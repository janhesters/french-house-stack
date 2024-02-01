import { z } from 'zod';

import { getSearchParameterFromRequest } from './get-search-parameter-from-request.server';

const getPageFromRequest = getSearchParameterFromRequest('page');

/**
 * Returns an always valid page number from the request query parameters.
 *
 * @param params - The request and the total number of items.
 * @returns A valid page number to query from.
 */
export function getValidPageFromRequest({
  request,
  totalItemCount,
  perPage = 10,
}: {
  request: Request;
  totalItemCount: number;
  perPage?: number;
}) {
  if (totalItemCount === 0) {
    return 1;
  }

  const page = getPageFromRequest(request);
  const totalPages = Math.ceil(totalItemCount / perPage);

  const pageSchema = z.preprocess(
    Number,
    z.number().int().positive().max(totalPages),
  );
  const result = pageSchema.safeParse(page);

  if (result.success) {
    return result.data;
  }

  if (result.error.issues[0].code === 'too_big') {
    return totalPages;
  }

  return 1;
}

/**
 * A middleware that adds a `currentPage` property to the middleware object
 * based on the `page` request query parameter and the total number of items.
 *
 * @param middleware - The middleware object.
 * @returns The middleware object with the `currentPage` property.
 */
export const withCurrentPage = <
  T extends { request: Request; totalItemCount: number },
>({
  request,
  totalItemCount,
  ...rest
}: T) => ({
  request,
  totalItemCount,
  currentPage: getValidPageFromRequest({ request, totalItemCount }),
  ...rest,
});
