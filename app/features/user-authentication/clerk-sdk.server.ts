import type { User } from '@clerk/remix/api.server';
import { createClerkClient } from '@clerk/remix/api.server';
import { getAuth } from '@clerk/remix/ssr.server';
import { prop } from 'ramda';

import { asyncPipe } from '~/utils/async-pipe';

export const clerkSdkServer = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const getUserFromClerkById = async (userId: string) => {
  return await clerkSdkServer.users.getUser(userId);
};

export const getSessionFromClerk = async (sessionToken: string) => {
  return await clerkSdkServer.sessions.getSession(sessionToken);
};

export const getUserAndSessionFromClerk = async (sessionToken: string) => {
  const session = await getSessionFromClerk(sessionToken);
  const user = await getUserFromClerkById(session.userId);
  return { user, session };
};

export const getUserFromClerkBySessionId = asyncPipe(
  getSessionFromClerk,
  prop('userId'),
  getUserFromClerkById,
);

export const revokeClerkSessionFromRequest = async (request: Request) => {
  const auth = await getAuth(
    { request, params: {}, context: {} },
    { secretKey: process.env.CLERK_SECRET_KEY },
  );
  if (auth.sessionId) {
    await clerkSdkServer.sessions.revokeSession(auth.sessionId);
  }
};

export const findUserClerkAccountByEmailAddress = async (
  email: string,
): Promise<User | undefined> => {
  const users = await clerkSdkServer.users.getUserList({
    emailAddress: [email],
  });
  return users.data[0];
};

export const createClerkUserAccount = async (email: string) => {
  return await clerkSdkServer.users.createUser({
    emailAddress: [email],
  });
};
