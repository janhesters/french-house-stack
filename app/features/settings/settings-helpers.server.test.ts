import { describe, expect, test } from 'vitest';

import { createUserWithOrganizations } from '~/test/test-utils';

import type { OnboardingUser } from '../onboarding/onboarding-helpers.server';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '../organizations/organizations-constants';
import { createPopulatedOrganization } from '../organizations/organizations-factories.server';
import {
  getUsersOwnedOrganizations,
  mapUserDataToSettingsProps,
} from './settings-helpers.server';

describe('mapUserDataToSettingsProps()', () => {
  test('given a user: returns the correct new organization props', async () => {
    const user = createUserWithOrganizations({ name: 'Phoenix Guerrero' });

    const actual = mapUserDataToSettingsProps({ user });
    const expected = {
      userNavigation: {
        abbreviation: 'PG',
        email: user.email,
        name: user.name,
        items: [],
      },
      user,
    };

    expect(actual).toEqual(expected);
  });
});

describe('getUsersOwnedOrganizations()', () => {
  test('given a user with no organizations: returns an empty array', async () => {
    const user = createUserWithOrganizations({ memberships: [] });

    const actual = getUsersOwnedOrganizations(user);
    const expected: OnboardingUser['memberships'][number]['organization'][] =
      [];

    expect(actual).toEqual(expected);
  });

  test("given a user with organizations, but they're never an owner: returns an empty array", async () => {
    const user = createUserWithOrganizations({
      memberships: [
        {
          role: ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
          organization: createPopulatedOrganization(),
          deactivatedAt: null,
        },
        {
          role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
          organization: createPopulatedOrganization(),
          deactivatedAt: null,
        },
      ],
    });

    const actual = getUsersOwnedOrganizations(user);
    const expected: OnboardingUser['memberships'][number]['organization'][] =
      [];

    expect(actual).toEqual(expected);
  });

  test("given a user with organizations, and they're the owner of some of them: returns the ones the user is an owner of", async () => {
    const ownedOrganization = createPopulatedOrganization();
    const user = createUserWithOrganizations({
      memberships: [
        {
          role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
          organization: createPopulatedOrganization(),
          deactivatedAt: null,
        },
        {
          role: ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
          organization: ownedOrganization,
          deactivatedAt: null,
        },
        {
          role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
          organization: createPopulatedOrganization(),
          deactivatedAt: null,
        },
      ],
    });

    const actual = getUsersOwnedOrganizations(user);
    const expected = [ownedOrganization];

    expect(actual).toEqual(expected);
  });
});
