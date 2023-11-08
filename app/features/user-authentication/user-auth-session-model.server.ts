import type { UserAuthSession, UserProfile } from '@prisma/client';

import { prisma } from '~/database.server';

export type PartialUserAuthSessionParameters = Pick<
  Parameters<typeof prisma.userAuthSession.create>[0]['data'],
  'id' | 'expirationDate'
>;

// CREATE

/**
 * Saves a new user auth session to the database.
 *
 * @param user auth session - Parameters of the user auth session that should be
 * created.
 * @returns The newly created user auth session.
 */
export async function saveUserAuthSessionToDatabase(
  userAuthSession: PartialUserAuthSessionParameters & {
    userId: UserProfile['id'];
  },
) {
  return prisma.userAuthSession.create({ data: userAuthSession });
}

// READ

/**
 * Retrieves a user auth session record from the database based on its id.
 *
 * @param id - The id of the user auth session to get.
 * @returns The user auth session with a given id or null if it wasn't found.
 */
export async function retrieveUserAuthSessionFromDatabaseById(
  id: UserAuthSession['id'],
) {
  return prisma.userAuthSession.findUnique({
    where: { id },
    select: {
      id: true,
      user: { select: { id: true, did: true } },
      expirationDate: true,
    },
  });
}

/**
 * Retrieves the first active user auth session from the database based on its
 * user id.
 *
 * @param userId - The id of the user to get the auth session for.
 * @returns The active user auth session for a given user or null if it wasn't
 * found.
 */
export async function retrieveActiveUserAuthSessionFromDatabaseByUserProfileId(
  userId: UserProfile['id'],
) {
  const currentDate = new Date();

  return prisma.userAuthSession.findFirst({
    where: { userId: userId, expirationDate: { gt: currentDate } },
    select: {
      id: true,
      user: { select: { id: true, did: true } },
      expirationDate: true,
    },
  });
}

// UPDATE

type UserAuthSessionUpdateParameters = Parameters<
  typeof prisma.userAuthSession.update
>[0]['data'] & {
  userId: UserProfile['id'];
};

/**
 *  Updates a user auth session in the database.
 *
 * @param options - A an object with the user auth session's id and the new values.
 * @returns The updated user auth session.
 */
export async function updateUserAuthSessionInDatabaseById({
  id,
  userAuthSession,
}: {
  /**
   * The id of the user auth session you want to update.
   */
  id: UserAuthSession['id'];
  /**
   * The values of the user auth session you want to change.
   */
  userAuthSession: Partial<Omit<UserAuthSessionUpdateParameters, 'id'>>;
}) {
  return prisma.userAuthSession.update({
    where: { id },
    data: userAuthSession,
  });
}

// DELETE

/**
 * Removes a session from the database.
 *
 * @param id - The id of the session you want to delete.
 * @returns The session that was deleted.
 */
export async function deleteUserAuthSessionFromDatabaseById(
  id: UserAuthSession['id'],
) {
  return prisma.userAuthSession.delete({ where: { id } });
}

/**
 * Deletes all user auth sessions for a given user id.
 *
 * @param userId - The id of the user whose auth sessions should be deleted.
 * @returns A count of how many records were deleted.
 */
export async function deleteUserAuthSessionsFromDatabaseByUserId(
  userId: UserProfile['id'],
) {
  return prisma.userAuthSession.deleteMany({ where: { userId } });
}
