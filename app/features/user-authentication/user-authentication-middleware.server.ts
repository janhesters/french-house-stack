import {
  requireAnonymous,
  requireUserIsAuthenticated,
} from './user-authentication-helpers.server';

/**
 * Enriches an existing middleware object with an anonymous user.
 *
 * @param object - A middleware object that contains the request.
 * @returns A new middleware object with the same properties as the input
 * object, plus an anonymous user.
 * @throws A redirect response to `/organizations` if the user is authenticated.
 */
export const withAnonymousUser = async <T extends { request: Request }>({
  request,
  ...rest
}: T) => ({
  request,
  user: await requireAnonymous(request),
  ...rest,
});

/**
 * Enriches an existing middleware object with a user id.
 *
 * @param object - A middleware object.
 * @returns A new middleware object with the same properties as the input
 * object, plus a user id.
 * @throws A redirect to the login page if the user is anonymous and logs the
 * user out.
 */
export const withAuth = async <
  T extends { request: Request } & { redirectTo?: string },
>({
  redirectTo,
  request,
  ...rest
}: T) => ({
  redirectTo,
  request,
  userId: await requireUserIsAuthenticated(request, redirectTo),
  ...rest,
});
