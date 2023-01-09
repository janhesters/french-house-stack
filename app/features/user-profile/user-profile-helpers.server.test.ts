// @vitest-environment node
import { describe, expect, test } from 'vitest';

import { generateRandomDid } from '~/test/generate-random-did.server';

import { createPopulatedUserProfile } from './user-profile-factories.server';
import { throwIfUserProfileIsMissing } from './user-profile-helpers.server';

describe('throwIfUserProfileIsMissing()', () => {
  test('given a user profile (the user exists): returns the user', () => {
    const user = createPopulatedUserProfile();

    expect(throwIfUserProfileIsMissing(generateRandomDid())(user)).toEqual(
      user,
    );
  });

  test("given null (the user doesn't exist): throws the correct error", () => {
    // `retrieveUserProfileFromDatabaseById` returns a UserProfile or null.
    const user = null;
    const userId = generateRandomDid();

    expect(() => throwIfUserProfileIsMissing(userId)(user)).toThrowError(
      'No user profile found with id: ' + userId,
    );
  });
});
