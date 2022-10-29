// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { assert } from '~/test/assert';
import generateRandomDid from '~/test/generate-random-did';

import { createPopulatedUserProfile } from './user-profile-factories';
import { throwIfUserProfileMissing } from './user-profile-helpers.server';

describe('throwIfUserProfileMissing()', () => {
  {
    const user = createPopulatedUserProfile();

    assert({
      given: 'a user profile (the user exists)',
      should: 'returns the user',
      actual: throwIfUserProfileMissing(user.id)(user),
      expected: user,
    });
  }

  it("given null (the user doesn't exist): throws the correct json response", () => {
    // `retrieveUserProfileFromDatabaseById` returns a UserProfile or null.
    // eslint-disable-next-line unicorn/no-null
    const user = null;
    const userId = generateRandomDid();

    expect(() => throwIfUserProfileMissing(userId)(user)).toThrowError(
      'No user profile found with id: ' + userId,
    );
  });
});
