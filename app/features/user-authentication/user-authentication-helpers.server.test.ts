import { describe, expect, test } from 'vitest';

import { createUserWithOrganizations } from '~/test/test-utils';

import { getLoginRedirectUrl } from './user-authentication-helpers.server';

describe('getLoginRedirectUrl()', () => {
  test("given a user profile with organizations: returns the first organization's home url", () => {
    const user = createUserWithOrganizations();

    const actual = getLoginRedirectUrl(user);
    const expected = `/organizations/${user.memberships[0].organization.slug}/home`;

    expect(actual).toBe(expected);
  });

  test('given a user profile without organizations: returns the onboarding page url', () => {
    const user = createUserWithOrganizations({ memberships: [] });

    const actual = getLoginRedirectUrl(user);
    const expected = '/onboarding';

    expect(actual).toBe(expected);
  });
});
