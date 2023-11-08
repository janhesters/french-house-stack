import { createCookieSessionStorage, type Session } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { asyncPipe } from '~/utils/async-pipe';

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set');

const USER_AUTH_SESSION_KEY = 'userAuthSessionId';
export const USER_AUTHENTICATION_SESSION_NAME = '__user-authentication-session';
export const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const userAuthenticationSessionStorage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    maxAge: 0,
    name: USER_AUTHENTICATION_SESSION_NAME,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
});

const getCookie = (request: Request) => request.headers.get('Cookie');

const getSessionFromCookie = (cookie: string | null) =>
  userAuthenticationSessionStorage.getSession(cookie);

export const getSession = asyncPipe(getCookie, getSessionFromCookie);

export const getUserAuthSessionId = (session: Session): string | undefined =>
  session.get(USER_AUTH_SESSION_KEY);

export async function createCookieForUserAuthSession({
  request,
  userAuthSessionId,
}: {
  request: Request;
  userAuthSessionId: string;
}) {
  const session = await getSession(request);
  session.set(USER_AUTH_SESSION_KEY, userAuthSessionId);
  return userAuthenticationSessionStorage.commitSession(session, {
    maxAge: ONE_YEAR_IN_SECONDS,
  });
}
