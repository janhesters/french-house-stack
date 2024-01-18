import { describe, expect, test } from 'vitest';

import type { Factory } from '~/utils/types';

import type { OnboardingUser } from '../onboarding/onboarding-helpers.server';
import { createPopulatedUserProfile } from '../user-profile/user-profile-factories.server';
import { createPopulatedOrganization } from './organizations-factories.server';
import {
  getOrganizationIsInUserMembershipList,
  getOrganizationSlug,
  mapOrganizationAndUserDataToSidebarProps,
  mapUserDataToNewOrganizationProps,
} from './organizations-helpers.server';

const createUserWithOrganizations: Factory<OnboardingUser> = ({
  memberships = [
    {
      role: 'member',
      organization: createPopulatedOrganization(),
      deactivatedAt: null,
    },
    {
      role: 'member',
      organization: createPopulatedOrganization(),
      deactivatedAt: null,
    },
    {
      role: 'member',
      organization: createPopulatedOrganization(),
      deactivatedAt: null,
    },
  ],
  ...props
} = {}) => ({ ...createPopulatedUserProfile(), ...props, memberships });

describe('getOrganizationSlug()', () => {
  test('given params with an organization slug: returns the organization slug', () => {
    const organizationSlug = createPopulatedOrganization().slug;
    const params = { organizationSlug };

    const actual = getOrganizationSlug(params);
    const expected = organizationSlug;

    expect(actual).toEqual(expected);
  });

  test('given params without an organization slug: returns an empty string', () => {
    const params = {};

    const actual = getOrganizationSlug(params);
    const expected = '';

    expect(actual).toEqual(expected);
  });
});

describe('getOrganizationIsInUserMembershipList()', () => {
  test('given a user and an organization ID they are an active member of: returns true', async () => {
    const organizationId = createPopulatedOrganization().id;
    const user = createUserWithOrganizations({
      memberships: [
        {
          organization: createPopulatedOrganization(),
          role: 'member',
          deactivatedAt: null,
        },
        {
          organization: createPopulatedOrganization({ id: organizationId }),
          role: 'member',
          deactivatedAt: null,
        },
        {
          organization: createPopulatedOrganization(),
          role: 'member',
          deactivatedAt: null,
        },
      ],
    });

    const actual = getOrganizationIsInUserMembershipList(organizationId, user);
    const expected = true;

    expect(actual).toEqual(expected);
  });

  test('given a user and an organization ID they are not member of: returns false', async () => {
    const organizationId = 'not-included';
    const user = createUserWithOrganizations();

    const actual = getOrganizationIsInUserMembershipList(organizationId, user);
    const expected = false;

    expect(actual).toEqual(expected);
  });
});

describe('mapOrganizationAndUserDataToSidebarProps()', () => {
  test('given a user and an organization slug: returns the correct sidebar props', async () => {
    const organizationSlug = 'tesla';
    const user = createUserWithOrganizations({
      name: 'Jordan Carter',
      memberships: [
        {
          role: 'member',
          organization: createPopulatedOrganization({ name: 'X' }),
          deactivatedAt: null,
        },
        {
          role: 'member',
          organization: createPopulatedOrganization({ name: 'Tesla' }),
          deactivatedAt: null,
        },
        {
          role: 'member',
          organization: createPopulatedOrganization({ name: 'Shopify' }),
          deactivatedAt: null,
        },
      ],
    });

    const actual = mapOrganizationAndUserDataToSidebarProps({
      organizationSlug,
      user,
    });
    const expected = {
      organizations: [
        { name: 'X', isCurrent: false, slug: 'x' },
        { name: 'Tesla', isCurrent: true, slug: 'tesla' },
        { name: 'Shopify', isCurrent: false, slug: 'shopify' },
      ],
      organizationSlug,
      userNavigation: {
        abbreviation: 'JC',
        email: user.email,
        name: user.name,
        items: [{ name: 'header:settings', href: '/settings' }],
      },
    };

    expect(actual).toEqual(expected);
  });
});

describe('mapUserDataToNewOrganizationProps()', () => {
  test('given a user: returns the correct new organization props', async () => {
    const user = createUserWithOrganizations({ name: 'Jordan Carter' });

    const actual = mapUserDataToNewOrganizationProps({ user });
    const expected = {
      userNavigation: {
        abbreviation: 'JC',
        email: user.email,
        name: user.name,
        items: [{ name: 'header:settings', href: '/settings' }],
      },
      user,
    };

    expect(actual).toEqual(expected);
  });
});
