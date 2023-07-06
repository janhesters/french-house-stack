import type { UserProfile } from '@prisma/client';

import { logout } from '../user-authentication/user-authentication-session.server';
import { retrieveUserProfileFromDatabaseById } from './user-profile-model.server';

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
    throw await logout(request);
  }

  return userProfile;
};

/**
 * A function to get a user profile by id. If this throws, there is likely a bug
 * occuring during sign up because all users should automatically get a user
 * profile. If that happens, it logs the user out, just in case.
 *
 * @param request - A Request object.
 * @param userId - The id of the user profile you want to check whether they
 * exist.
 * @returns A user's profile if they exists, otherwise throws an error.
 */
export const requireUserProfileExists = async (
  request: Request,
  userId: string,
) => {
  const user = await retrieveUserProfileFromDatabaseById(userId);
  return await throwIfUserProfileIsMissing(request, user);
};
