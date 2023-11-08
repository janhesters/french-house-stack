import { asyncPipe } from '~/utils/async-pipe';

import { retrieveFirstUserProfileFromDatabaseByEmail } from './user-profile-model.server';

/**
 * Returns a boolean whether a user profile with the given email exists.
 *
 * @param email - The email to check for.
 * @returns A promise that resolves with boolean whether a user profile with the
 * given email exists.
 */
export const doesUserProfileExistByEmail = asyncPipe(
  retrieveFirstUserProfileFromDatabaseByEmail,
  Boolean,
);
