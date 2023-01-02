import {
  allPass,
  always,
  complement,
  identity,
  ifElse,
  is,
  isEmpty,
  pipe,
  startsWith,
} from 'ramda';

import { getSearchParameterFromRequest } from './get-search-parameter-from-request';

const getRedirectToSearchParameter =
  getSearchParameterFromRequest('redirectTo');
const isNotEmpty = complement(isEmpty);
export const isValidRedirectDestination = (
  to: FormDataEntryValue | string | null | undefined,
): to is string =>
  is(String, to) &&
  allPass([isNotEmpty, startsWith('/'), complement(startsWith('//'))])(to);

/**
 * This should be used any time the redirect path is user-provided
 * (like the query string on our login pages). This avoids
 * open-redirect vulnerabilities.
 *
 * @param request The to grab the redirectTo search parameter from.
 * @param defaultRedirect The redirect to use if the redirectTo is unsafe.
 * @returns A url that can be safely redirected to.
 */
export const getSafeRedirectDestination = (
  request: Request,
  defaultRedirect = '/',
): string =>
  pipe(
    getRedirectToSearchParameter,
    ifElse(isValidRedirectDestination, identity, always(defaultRedirect)),
  )(request);
