import type { UserProfile } from '@prisma/client';
import { not } from 'ramda';

import { asyncPipe } from '~/utils/async-pipe';

import {
  logout,
  requireUserIsAuthenticated,
} from '../user-authentication/user-authentication-helpers.server';
import {
  retrieveFirstUserProfileFromDatabaseByEmail,
  retrieveUserProfileWithMembershipsFromDatabaseById,
} from './user-profile-model.server';

/**
 * Returns a boolean whether a user profile with the given email exists.
 *
 * @param email - The email to check for.
 * @returns A promise that resolves with boolean whether a user profile with the
 * given email exists.
 */
export const getDoesUserProfileExistByEmail = asyncPipe(
  retrieveFirstUserProfileFromDatabaseByEmail,
  Boolean,
);

/**
 * Returns a boolean indicating whether a user profile with the given email does
 * NOT exist.
 *
 * @param email - The email to check for.
 * @returns A promise that resolves with boolean indicating whether a user
 * profile with the given email does NOT exist.
 */
export const getIsEmailAvailableForRegistration = asyncPipe(
  getDoesUserProfileExistByEmail,
  not,
);

/**
 * Ensures that a user profile is present.
 *
 * @param user profile - The user profile to check - possibly null or undefined.
 * @returns The same user profile if it exists.
 * @throws Logs the user out if the user profile is missing.
 */
export const throwIfUserProfileIsMissing = async <T extends UserProfile>(
  request: Request,
  userProfile: T | null,
) => {
  if (!userProfile) {
    throw await logout(request, '/login');
  }

  return userProfile;
};

/**
 * Ensures the user exists and has a valid profile.
 *
 * @param request - The Request object containing the user's request.
 * @returns The user object if the user exists and has a valid profile.
 * @throws A Response with the appropriate error status if the user is not
 * authenticated or missing a profile.
 */
export async function requireUserExists(request: Request) {
  const userId = await requireUserIsAuthenticated(request);
  const user = await retrieveUserProfileWithMembershipsFromDatabaseById(userId);
  return throwIfUserProfileIsMissing(request, user);
}

type getNameAbbreviation = (userProfile: UserProfile['name']) => string;
/**
 * Generates an uppercased abbreviation of a user's name.
 *
 * @param userProfile - The `UserProfile` object containing the user's name.
 * @returns The abbreviated name as a string. If the name is not provided, an
 * empty string is returned.
 */
export const getNameAbbreviation: getNameAbbreviation = name => {
  const parts = name.trim().split(' ');
  return parts.length === 0
    ? ''
    : parts.length === 1
      ? parts[0].slice(0, 1).toUpperCase()
      : `${parts[0].slice(0, 1)}${parts.at(-1)!.slice(0, 1)}`.toUpperCase();
};
