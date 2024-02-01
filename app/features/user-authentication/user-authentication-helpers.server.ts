import { createId } from '@paralleldrive/cuid2';
import { redirect } from '@remix-run/node';
import { safeRedirect } from 'remix-utils/safe-redirect';

import { combineHeaders } from '~/utils/combine-headers.server';

import {
  getUserIsOnboarded,
  type OnboardingUser,
} from '../onboarding/onboarding-helpers.server';
import { magicAdmin } from './magic-admin.server';
import {
  deleteUserAuthSessionsFromDatabaseByUserId,
  retrieveUserAuthSessionFromDatabaseById,
  saveUserAuthSessionToDatabase,
} from './user-auth-session-model.server';
import {
  createCookieForUserAuthSession,
  getSession,
  getUserAuthSessionId,
  userAuthenticationSessionStorage,
} from './user-authentication-session.server';

/**
 * Returns the URL to redirect the user to after a successful login.
 *
 * @param user - The user with its memberships to get the redirect URL for.
 * @returns The url to the user's first organization's home page if the user is
 * onboarded, otherwise the onboarding page url.
 */
export const getLoginRedirectUrl = (user: OnboardingUser) =>
  getUserIsOnboarded(user)
    ? `/organizations/${user.memberships[0].organization.slug}/home`
    : '/onboarding';

const ONE_YEAR_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 365;

/**
 * Performs the login process for a user by creating a new user authentication
 * session with a one-year expiration and sets a cookie in the user's browser to
 * maintain the session.
 *
 * @param params - An object containing the parameters for the login process.
 * @param params.request - The request object representing the incoming HTTP
 * request.
 * @param params.userId - The unique identifier of the user who is logging in.
 * @param params.redirectTo - (Optional) The URL to redirect the user to after a
 * successful login. Defaults to '/organizations'.
 * @param params.init - (Optional) The options for setting headers, status code,
 * etc. on the response.
 * @returns A Promise that resolves to a response object that redirects the user
 * and sets the necessary cookie.
 */
export async function login({
  request,
  userId,
  redirectTo = '/organizations',
  init,
}: {
  request: Request;
  userId: string;
  redirectTo?: string;
  init?: ResponseInit;
}) {
  const userAuthSession = await saveUserAuthSessionToDatabase({
    expirationDate: new Date(Date.now() + ONE_YEAR_IN_MILLISECONDS),
    id: createId(),
    userId,
  });

  return redirect(safeRedirect(redirectTo), {
    headers: combineHeaders(init?.headers, {
      'Set-Cookie': await createCookieForUserAuthSession({
        request,
        userAuthSessionId: userAuthSession.id,
      }),
    }),
  });
}

/**
 * Retrieves the user authentication session from the database and returns it
 * along with the session object from the request.
 *
 * @param request - The request object.
 * @returns An object containing the user authentication session and the session
 * object from the request.
 */
export async function getUserAuthSession(request: Request) {
  const session = await getSession(request);
  const userAuthSessionId = getUserAuthSessionId(session);

  if (userAuthSessionId) {
    const userAuthSession =
      await retrieveUserAuthSessionFromDatabaseById(userAuthSessionId);

    return { session, userAuthSession };
  }

  // eslint-disable-next-line unicorn/no-null
  return { session, userAuthSession: null };
}

/**
 * Logs the user out, destroys all of the user's sessions and clears their
 * cookies.
 *
 * @param request - The request object.
 * @returns A redirect response to the login page.
 */
export async function logout(request: Request, redirectTo: string = '/') {
  const { session, userAuthSession } = await getUserAuthSession(request);

  if (userAuthSession) {
    await Promise.allSettled([
      magicAdmin.users.logoutByIssuer(userAuthSession.user.did),
      deleteUserAuthSessionsFromDatabaseByUserId(userAuthSession.user.id),
    ]);
  }

  return redirect(safeRedirect(redirectTo), {
    headers: {
      'Set-Cookie':
        await userAuthenticationSessionStorage.destroySession(session),
    },
  });
}

/**
 * Requires the user to be anonymous.
 *
 * @param request - The request object.
 * @throws A redirect response to `/organizations` if the user is already logged
 * in.
 */
export async function requireAnonymous(request: Request) {
  const { userAuthSession } = await getUserAuthSession(request);

  if (userAuthSession) {
    throw redirect('/organizations');
  }

  return request;
}

/**
 * A function to use in loader functions to make sure the user is authenticated.
 *
 * @param request The request to check.
 * @param redirectTo The path to redirect to if not logged in.
 * @returns The current user's id if the user is authentiacted, otherwise logs
 * the user out for real and throws a redirect response to the login page.
 */
export async function requireUserIsAuthenticated(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const { userAuthSession } = await getUserAuthSession(request);

  if (userAuthSession) {
    return userAuthSession.user.id;
  }

  const searchParameters = new URLSearchParams([['redirectTo', redirectTo]]);
  throw await logout(request, `/login?${searchParameters.toString()}`);
}
