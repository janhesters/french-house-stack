import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { createUserWithOrganizations } from '~/test/test-utils';

import { ORGANIZATION_MEMBERSHIP_ROLES } from './organizations-constants';
import { createPopulatedOrganization } from './organizations-factories.server';
import {
  getOrganizationSlug,
  getUsersRoleForOrganizationBySlug,
  mapOrganizationAndUserDataToSidebarProps,
  mapUserDataToNewOrganizationProps,
} from './organizations-helpers.server';

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

describe('mapOrganizationAndUserDataToSidebarProps()', () => {
  test('given a user and an organization slug: returns the correct sidebar props', () => {
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
  test('given a user: returns the correct new organization props', () => {
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

describe('getUsersRoleForOrganizationBySlug()', () => {
  const availableRoles = Object.values(ORGANIZATION_MEMBERSHIP_ROLES);

  test.each(availableRoles)(
    'given an onboarding user and an organization slug: returns the users role for the organization',
    role => {
      const organization = createPopulatedOrganization();

      const user = createUserWithOrganizations({
        memberships: [
          {
            role,
            organization,
            deactivatedAt: null,
          },
          {
            role: faker.helpers.arrayElement(availableRoles),
            organization: createPopulatedOrganization(),
            deactivatedAt: null,
          },
          {
            role: faker.helpers.arrayElement(availableRoles),
            organization: createPopulatedOrganization(),
            deactivatedAt: null,
          },
        ],
      });

      const actual = getUsersRoleForOrganizationBySlug(user, organization.slug);
      const expected = role;

      expect(actual).toEqual(expected);
    },
  );

  test('given the user is NOT a member of the organization: throws a 404 error', () => {
    expect.assertions(1);

    const user = createUserWithOrganizations();
    const { slug } = createPopulatedOrganization();

    try {
      getUsersRoleForOrganizationBySlug(user, slug);
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(404);
      }
    }
  });
});
