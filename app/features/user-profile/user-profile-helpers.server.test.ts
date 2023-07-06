// @vitest-environment node
import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { createPopulatedUserProfile } from './user-profile-factories.server';
import { throwIfUserProfileIsMissing } from './user-profile-helpers.server';

describe('throwIfUserProfileIsMissing()', () => {
  test('given a request and a user profile: returns the user profile', async () => {
    const user = createPopulatedUserProfile();

    expect(
      await throwIfUserProfileIsMissing(
        new Request(faker.internet.url()),
        user,
      ),
    ).toEqual(user);
  });

  test('given a request and null: throws a redirect to the login page and removes any auth cookies', async () => {
    expect.assertions(1);

    try {
      await throwIfUserProfileIsMissing(
        new Request(faker.internet.url()),
        null,
      );
    } catch (error) {
      expect(error).toEqual(
        new Response(null, {
          status: 302,
          headers: {
            Location: '/',
            'Set-Cookie':
              '__user-authentication-session=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
          },
        }),
      );
    }
  });
});
