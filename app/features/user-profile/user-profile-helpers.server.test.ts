// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { assert } from '~/test/assert';
import generateRandomDid from '~/test/generate-random-did.server';

import { createPopulatedUserProfile } from './user-profile-factories.server';
import { throwIfUserProfileIsMissing } from './user-profile-helpers.server';

describe('throwIfUserProfileIsMissing()', () => {
  {
    const user = createPopulatedUserProfile();

    assert({
      given: 'a user profile (the user exists)',
      should: 'returns the user',
      actual: throwIfUserProfileIsMissing(user.id)(user),
      expected: user,
    });
  }

  it("given null (the user doesn't exist): throws the correct error", () => {
    // `retrieveUserProfileFromDatabaseById` returns a UserProfile or null.
    const user = null;
    const userId = generateRandomDid();

    expect(() => throwIfUserProfileIsMissing(userId)(user)).toThrowError(
      'No user profile found with id: ' + userId,
    );
  });
});
