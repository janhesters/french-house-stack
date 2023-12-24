import { createId } from '@paralleldrive/cuid2';
import { redirect } from '@remix-run/node';

import { magicAdmin } from './magic-admin.server';
import {
  deleteUserAuthSessionsFromDatabaseByUserId,
  retrieveActiveUserAuthSessionFromDatabaseByUserProfileId,
  saveUserAuthSessionToDatabase,
} from './user-auth-session-model.server';
import {
  createCookieForUserAuthSession,
  getSession,
  getUserAuthSessionId,
} from './user-authentication-session.server';

const ONE_YEAR_IN_SECONDS = 1000 * 60 * 60 * 24 * 365;

export async function login({
  request,
  userId,
  redirectTo,
}: {
  request: Request;
  userId: string;
  redirectTo: string;
}) {
  const userAuthSession = await saveUserAuthSessionToDatabase({
    expirationDate: new Date(Date.now() + ONE_YEAR_IN_SECONDS),
    id: createId(),
    userId,
  });

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await createCookieForUserAuthSession({
        request,
        userAuthSessionId: userAuthSession.id,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  const userAuthSessionId = getUserAuthSessionId(session);

  if (userAuthSessionId) {
    const userAuthSession =
      await retrieveActiveUserAuthSessionFromDatabaseByUserProfileId(
        userAuthSessionId,
      );

    if (userAuthSession) {
      await Promise.all([
        magicAdmin.users.logoutByIssuer(userAuthSession.user.id),
        deleteUserAuthSessionsFromDatabaseByUserId(userAuthSessionId),
      ]);
    }
  }

  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

export async function requireAnonymous(request: Request) {
  const session = await getSession(request);
  const userAuthSessionId = getUserAuthSessionId(session);

  if (userAuthSessionId) {
    throw redirect('/');
  }
}
