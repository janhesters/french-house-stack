import type { Session } from '@remix-run/node';
import { createCookieSessionStorage, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { magicAdmin } from './magic-admin.server';
import {
  deleteUserAuthSessionFromDatabaseById,
  retrieveActiveUserAuthSessionFromDatabaseById,
  saveUserAuthSessionToDatabase,
} from './user-auth-session-model.server';

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set');

export const USER_AUTHENTICATION_SESSION_NAME = '__user-authentication-session';

const sessionStorage = createCookieSessionStorage({
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

async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

const SESSION_KEY = 'sessionId';

const getSessionIdFromSession = (session: Session): string | undefined => {
  const sessionId = session.get(SESSION_KEY);
  return sessionId;
};

async function getCredentialsFromSession(session: Session) {
  const sessionId = getSessionIdFromSession(session);

  if (sessionId) {
    const userSession = await retrieveActiveUserAuthSessionFromDatabaseById(
      sessionId,
    );

    return {
      userAuthSessionId: sessionId,
      userId: userSession?.user.id,
      did: userSession?.user.did,
    };
  }

  return;
}

async function getCredentialsFromRequest(request: Request) {
  const session = await getSession(request);
  return await getCredentialsFromSession(session);
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
  const credentials = await getCredentialsFromRequest(request);

  if (!credentials || !credentials.userId) {
    const searchParameters = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParameters}`);
  }

  return credentials.userId;
}

async function createCookieForUserAuthSession({
  request,
  sessionId,
  remember,
}: {
  request: Request;
  sessionId: string;
  remember: boolean;
}) {
  const session = await getSession(request);
  session.set(SESSION_KEY, sessionId);
  return sessionStorage.commitSession(session, {
    // 365 days
    maxAge: remember ? 60 * 60 * 24 * 365 : undefined,
  });
}

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 365; // 1 year

export async function createCookieForUserId({
  request,
  userId,
  remember,
}: {
  request: Request;
  userId: string;
  remember: boolean;
}) {
  const userAuthSession = await saveUserAuthSessionToDatabase({
    userId,
    expirationDate: new Date(Date.now() + SESSION_EXPIRATION_TIME),
  });
  return createCookieForUserAuthSession({
    request,
    sessionId: userAuthSession.id,
    remember,
  });
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
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await createCookieForUserId({
        request,
        userId,
        remember,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  const credentials = await getCredentialsFromSession(session);

  if (credentials) {
    const { userAuthSessionId, did } = credentials;

    await deleteUserAuthSessionFromDatabaseById(userAuthSessionId);

    if (did) {
      await magicAdmin.users.logoutByIssuer(did);
    }
  }

  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
