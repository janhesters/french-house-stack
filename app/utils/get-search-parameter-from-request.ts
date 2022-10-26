import { pipe } from 'ramda';

/**
 * Create a URL instance from a Request object.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request|Request} on MDN.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL|Url} on MDN.
 *
 * @param request - A resource request from the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
 * @returns A URL interface.
 */
export const requestToUrl = (request: Request) => new URL(request.url);

export const getSearchParameterFromUrl =
  (searchParameter: string) => (url: URL) =>
    url.searchParams.get(searchParameter);

export const getSearchParameterFromRequest = (searchParameter: string) =>
  pipe(requestToUrl, getSearchParameterFromUrl(searchParameter));
