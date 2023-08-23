import type { Session } from '@remix-run/node';
import { createCookieSessionStorage, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { magicAdmin } from './magic-admin.server';

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set');

export const USER_AUTHENTICATION_SESSION_NAME = '__user-authentication-session';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: USER_AUTHENTICATION_SESSION_NAME,
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
});

const USER_SESSION_KEY = 'userId';

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

const getUserIdFromSession = (session: Session): string | undefined => {
  const userId = session.get(USER_SESSION_KEY);
  console.warn('userId', userId);
  return userId;
};

export async function getUserId(request: Request): Promise<string | undefined> {
  const session = await getSession(request);
  return getUserIdFromSession(session);
}

/**
 * A function to use in loader functions to make sure the user is authenticated.
 * @param request The request to check.
 * @param redirectTo The path to redirect to if not logged in.
 * @returns The current user's id.
 */
export async function requireUserIsAuthenticated(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request);

  if (!userId) {
    const searchParameters = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParameters}`);
  }

  return userId;
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 365 // 365 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  const userId = getUserIdFromSession(session);

  if (userId) {
    await magicAdmin.users.logoutByIssuer(userId);
  }

  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
