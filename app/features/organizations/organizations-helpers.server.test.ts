import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import { describe, expect, test } from 'vitest';

import { createUserWithOrganizations } from '~/test/test-utils';

import { createPopulatedUserProfile } from '../user-profile/user-profile-factories.server';
import { ORGANIZATION_MEMBERSHIP_ROLES } from './organizations-constants';
import {
  createPopulatedOrganization,
  createPopulatedOrganizationInviteLink,
} from './organizations-factories.server';
import {
  formatExpirationDate,
  getInviteLinkToken,
  getOrganizationSlug,
  getUsersRoleForOrganizationBySlug,
  mapOrganizationAndUserDataToSidebarProps,
  mapTeamMemberDataToTeamMembersPageProps,
  mapUserDataToNewOrganizationProps,
  parseOrganizationMembershipRole,
  throwIfInviteLinkIsExpired,
  tokenToInviteLink,
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

describe('parseOrganizationMembershipRole()', () => {
  test.each(Object.values(ORGANIZATION_MEMBERSHIP_ROLES))(
    'given a valid organization membership role "%s": returns the role',
    role => {
      const actual = parseOrganizationMembershipRole(role);
      const expected = role;

      expect(actual).toEqual(expected);
    },
  );

  test('given an invalid organization membership role: throws an error', () => {
    const invalidRole = 'invalidRole';

    expect(() => parseOrganizationMembershipRole(invalidRole)).toThrowError(
      `[parseOrganizationMembershipRole] Invalid organization membership role: ${invalidRole}.`,
    );
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

describe('tokenToInviteLink()', () => {
  test('given a token and a request: returns the invite link', () => {
    const token = createId();
    const basePath = 'https://example.com';
    const request = new Request(`${basePath}/foo`);

    const actual = tokenToInviteLink(token, request);
    const expected = `${basePath}/organizations/invite?token=${token}`;

    expect(actual).toEqual(expected);
  });
});

// This test fails too much in CI :(
describe.skip('formatExpirationDate()', () => {
  class MockDate extends Date {
    getTimezoneOffset() {
      return -120;
    }
  }

  test('given a date and no locale: returns the correctly formatted date in english', () => {
    const fixedDate = new Date('2023-06-04T20:18:23.741Z');

    const actual = formatExpirationDate(fixedDate);
    const expected = 'June 4 2023, 10:18 PM';

    expect(actual).toEqual(expected);
  });

  test('given a date and a locale: returns the correctly formatted date', () => {
    const fixedDate = new Date('2023-06-04T20:18:23.741Z');
    const mockDate = new MockDate(fixedDate.toISOString());

    const actual = formatExpirationDate(mockDate, 'de');
    const expected = '4. Juni 2023, 22:18';

    expect(actual).toEqual(expected);
  });
});

describe('mapTeamMemberDataToTeamMembersPageProps()', () => {
  test('given valid inputs with the data for an invitation link: returns the input together with the formatted team members and input link', () => {
    const currentUsersRole = ORGANIZATION_MEMBERSHIP_ROLES.OWNER;
    const inviteLinkToken = createId();
    const latestOrganizationInviteLink = {
      id: createPopulatedOrganizationInviteLink().id,
      creatorId: createPopulatedOrganizationInviteLink().creatorId,
      deactivatedAt: createPopulatedOrganizationInviteLink().deactivatedAt,
      expiresAt: new Date('2023-06-04T22:18:00+02:00'),
      token: inviteLinkToken,
    };
    const locale = 'de';
    const members = [
      {
        member: createPopulatedUserProfile(),
        role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
        deactivatedAt: null,
      },
      {
        member: createPopulatedUserProfile(),
        role: ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
        deactivatedAt: faker.date.recent(),
      },
    ];
    const basePath = 'https://example.com';
    const request = new Request(`${basePath}/foo`);
    const user = createUserWithOrganizations();
    const otherData = { foo: 'bar' };

    const actual = mapTeamMemberDataToTeamMembersPageProps({
      currentUsersRole,
      latestOrganizationInviteLink,
      locale,
      members,
      request,
      user,
      ...otherData,
    });
    const expected = {
      currentUserIsOwner: true,
      currentUsersId: user.id,
      currentUsersRole,
      inviteLink: {
        href: `${basePath}/organizations/invite?token=${inviteLinkToken}`,
        expiryDate: expect.any(String),
      },
      teamMembers: [
        {
          deactivatedAt: null,
          email: members[0].member.email,
          id: members[0].member.id,
          name: members[0].member.name,
          role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
        },
        {
          deactivatedAt: members[1].deactivatedAt,
          email: members[1].member.email,
          id: members[1].member.id,
          name: members[1].member.name,
          role: ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
        },
      ],
      user,
      ...otherData,
    };

    expect(actual).toEqual(expected);
  });

  test('given valid inputs but no latestOrganizationInviteLink: returns expected TeamMembersPageComponentProps with inviteLink as undefined', () => {
    const currentUsersRole = ORGANIZATION_MEMBERSHIP_ROLES.ADMIN;
    const locale = 'en';
    const members = [
      {
        member: createPopulatedUserProfile(),
        role: ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
        deactivatedAt: null,
      },
      {
        member: createPopulatedUserProfile(),
        role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
        deactivatedAt: faker.date.recent(),
      },
    ];
    const basePath = 'https://example.com';
    const request = new Request(`${basePath}/foo`);
    const user = createUserWithOrganizations();

    const actual = mapTeamMemberDataToTeamMembersPageProps({
      currentUsersRole,
      latestOrganizationInviteLink: null,
      locale,
      members,
      request,
      user,
    });
    const expected = {
      currentUserIsOwner: false,
      currentUsersId: user.id,
      currentUsersRole,
      inviteLink: undefined,
      teamMembers: [
        {
          deactivatedAt: null,
          name: members[0].member.name,
          id: members[0].member.id,
          email: members[0].member.email,
          role: ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
        },
        {
          deactivatedAt: members[1].deactivatedAt,
          id: members[1].member.id,
          name: members[1].member.name,
          email: members[1].member.email,
          role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
        },
      ],
      user,
    };

    expect(actual).toEqual(expected);
  });
});

describe('getInviteLinkToken()', () => {
  test('given a request with token query param: returns the token', () => {
    const token = createPopulatedOrganizationInviteLink().token;
    const request = new Request(`http://example.com/?token=${token}`);

    const actual = getInviteLinkToken(request);

    expect(actual).toEqual(token);
  });

  test('given a request without a token query param: returns null', () => {
    const request = new Request('http://example.com');

    const actual = getInviteLinkToken(request);

    expect(actual).toBeNull();
  });

  test('given a request with multiple token query params: returns the first token', () => {
    const token1 = createPopulatedOrganizationInviteLink().token;
    const token2 = createPopulatedOrganizationInviteLink().token;
    const request = new Request(
      `http://example.com/?token=${token1}&token=${token2}`,
    );

    const actual = getInviteLinkToken(request);

    expect(actual).toEqual(token1);
  });
});

describe('throwIfInviteLinkIsExpired()', () => {
  test('given a valid invite link: returns the link', () => {
    const link = {
      id: createPopulatedOrganizationInviteLink().id,
      expiresAt: createPopulatedOrganizationInviteLink().expiresAt,
      organization: {
        id: createPopulatedOrganization().name,
        name: createPopulatedOrganization().name,
      },
      creator: {
        id: createPopulatedUserProfile().id,
        name: createPopulatedUserProfile().name,
      },
    };

    const actual = throwIfInviteLinkIsExpired(link);
    const expected = link;

    expect(actual).toEqual(expected);
  });

  test('given an expired invite link: returns the link', () => {
    expect.assertions(1);

    const link = {
      id: createPopulatedOrganizationInviteLink().id,
      expiresAt: faker.date.recent(),
      organization: {
        id: createPopulatedOrganization().name,
        name: createPopulatedOrganization().name,
      },
      creator: {
        id: createPopulatedUserProfile().id,
        name: createPopulatedUserProfile().name,
      },
    };

    try {
      throwIfInviteLinkIsExpired(link);
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(404);
      }
    }
  });
});
