import type { UserProfile } from '@prisma/client';

import { asyncPipe } from '~/utils/async-pipe';

import { retrieveUserProfileFromDatabaseById } from './user-profile-model.server';

export const throwIfUserProfileIsMissing =
  (userId: string) =>
  <T extends UserProfile>(userProfile: T | null) => {
    if (!userProfile) {
      // TODO: report error
      throw new Error('No user profile found with id: ' + userId);
    }

    return userProfile;
  };

/**
 * A function to get a user profile by id. If this throws, there is likely a bug
 * occuring during sign up because all users should automatically get a user
 * profile.
 *
 * @param userId - The id of the user profile you want to check whether they
 * exist.
 * @returns A user's profile if they exists, otherwise throws an error.
 */
export const requireUserProfileExists = (userId: string) =>
  asyncPipe(
    retrieveUserProfileFromDatabaseById,
    throwIfUserProfileIsMissing(userId),
  )(userId);
