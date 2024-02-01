import type { UserProfile } from '@prisma/client';

import { prisma } from '~/database.server';

export type PartialUserProfileParameters = Pick<
  Parameters<typeof prisma.userProfile.create>[0]['data'],
  'acceptedTermsAndConditions' | 'did' | 'email' | 'id' | 'name'
>;

// CREATE

/**
 * Saves a new user profile to the database.
 *
 * @param user profile - Parameters of the user profile that should be created.
 * @returns The newly created user profile.
 */
export async function saveUserProfileToDatabase(
  userProfile: PartialUserProfileParameters,
) {
  return prisma.userProfile.create({ data: userProfile });
}

// READ

/**
 * Retrieves a user profile record from the database based on its id.
 *
 * @param id - The id of the user profile to retrieve.
 * @returns The user profile with a given id or null if it wasn't found.
 */
export async function retrieveUserProfileFromDatabaseById(
  id: UserProfile['id'],
) {
  return prisma.userProfile.findUnique({ where: { id } });
}

/**
 * Returns the first user profile that exists in the database with the given
 * email.
 *
 * @param email - The email of the user profile to retrieve.
 * @returns The user profile with the given email, or null if it wasn't found.
 */
export async function retrieveFirstUserProfileFromDatabaseByEmail(
  email: string,
) {
  return prisma.userProfile.findFirst({ where: { email } });
}

/**
 * Retrieves a user profile record from the database based on its id and
 * includes the active memberships for the organizations the user is a member
 * of.
 *
 * @param id - The id of the user profile to get.
 * @returns The user profile with their active memberships for the organizations
 * of which they are a member of for the given id or null if it wasn't found.
 */
export async function retrieveUserProfileWithMembershipsFromDatabaseById(
  id: UserProfile['id'],
) {
  return prisma.userProfile.findUnique({
    where: { id },
    include: {
      memberships: {
        where: {
          // eslint-disable-next-line unicorn/no-null
          OR: [{ deactivatedAt: null }, { deactivatedAt: { gt: new Date() } }],
        },
        select: {
          organization: { select: { id: true, name: true, slug: true } },
          role: true,
          deactivatedAt: true,
        },
      },
    },
  });
}

/**
 * Retrieves a user profile record from the database based on its did and
 * includes the active memberships for the organizations the user is a member
 * of.
 *
 * @param did - The did of the user profile to get.
 * @returns The user profile with their active memberships for the organizations
 * of which they are a member of for the given id or null if it wasn't found.
 */
export async function retrieveUserProfileWithMembershipsFromDatabaseByDid(
  did: UserProfile['did'],
) {
  return prisma.userProfile.findUnique({
    where: { did },
    include: {
      memberships: {
        where: {
          // eslint-disable-next-line unicorn/no-null
          OR: [{ deactivatedAt: null }, { deactivatedAt: { gt: new Date() } }],
        },
        select: {
          organization: { select: { id: true, name: true, slug: true } },
          role: true,
          deactivatedAt: true,
        },
      },
    },
  });
}

// UPDATE

/**
 *  Updates a user profile in the database.
 *
 * @param options - A an object with the user profile's id and the new values.
 * @returns The updated user profile.
 */
export async function updateUserProfileInDatabaseById({
  id,
  userProfile,
}: {
  /**
   * The id of the user profile you want to update.
   */
  id: UserProfile['id'];
  /**
   * The values of the user profile you want to change.
   */
  userProfile: Partial<
    Omit<Parameters<typeof prisma.userProfile.update>[0]['data'], 'id'>
  >;
}) {
  return prisma.userProfile.update({ where: { id }, data: userProfile });
}

// DELETE

/**
 * Removes a user profile from the database.
 *
 * @param id - The id of the user profile you want to delete.
 * @returns The user profile that was deleted.
 */
export async function deleteUserProfileFromDatabaseById(id: UserProfile['id']) {
  return prisma.userProfile.delete({ where: { id } });
}
