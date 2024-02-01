import { faker } from '@faker-js/faker';
import type { TFunction } from 'i18next';
import { describe, expect, test } from 'vitest';

import { createUserWithOrganizations } from '~/test/test-utils';

import { ORGANIZATION_MEMBERSHIP_ROLES } from './organizations-constants';
import {
  createPopulatedOrganization,
  createPopulatedOrganizationInviteLink,
} from './organizations-factories.server';
import {
  withHeaderProps,
  withInviteLinkToken,
  withOrganizationSlug,
  withUserIsMemberOfOrganization,
} from './organizations-middleware.server';

describe('withOrganizationSlug()', () => {
  test('given an object with params with an organization slug: adds an organization slug to the object', () => {
    const organizationSlug = createPopulatedOrganization().slug;
    const object = { params: { organizationSlug }, otherData: 'data' };

    const actual = withOrganizationSlug(object);
    const expected = {
      params: { organizationSlug },
      otherData: 'data',
      organizationSlug,
    };

    expect(actual).toEqual(expected);
  });

  test('given an object with params without an organization slug: adds an empty organization slug to the object', () => {
    const object = { params: {}, otherData: 'data' };

    const actual = withOrganizationSlug(object);
    const expected = { params: {}, otherData: 'data', organizationSlug: '' };

    expect(actual).toEqual(expected);
  });
});

describe('withUserIsMemberOfOrganization()', () => {
  test("given a user who is an active member of the organization: returns the input and the current user's role", () => {
    const organization = createPopulatedOrganization();
    const currentUsersRole = faker.helpers.arrayElement(
      Object.values(ORGANIZATION_MEMBERSHIP_ROLES),
    );
    const user = createUserWithOrganizations({
      memberships: [
        {
          organization: createPopulatedOrganization(),
          role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
          deactivatedAt: null,
        },
        {
          organization: createPopulatedOrganization(),
          role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
          deactivatedAt: null,
        },
        {
          organization: organization,
          role: currentUsersRole,
          deactivatedAt: null,
        },
      ],
    });
    const input = { user, organization, currentUsersRole, otherData: 'data' };

    const actual = withUserIsMemberOfOrganization(input);
    const expected = input;

    expect(actual).toEqual(expected);
  });

  test('given a user who is not a member of the organization: throws a 404 not found error', () => {
    expect.assertions(1);

    const organization = createPopulatedOrganization();
    const user = createUserWithOrganizations();
    const input = { user, organization, otherData: 'data' };

    try {
      withUserIsMemberOfOrganization(input);
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(404);
      }
    }
  });
});

const t = ((key: string) =>
  ({
    'app-name': 'AppName',
    dashboard: 'Dashboard',
    greeting: 'Hello',
  })[key] ?? null) as TFunction;

describe('withHeaderProps()', () => {
  test('given a headerTitleKey and no renderBackButton: returns an object with translated headerTitle and default renderBackButton', () => {
    const headerTitleKey = 'dashboard';
    const expectedTranslation = 'Dashboard';
    const middleware = { t, otherData: 'data' };

    const actual = withHeaderProps({ headerTitleKey })(middleware);
    const expected = {
      t,
      otherData: 'data',
      headerTitle: expectedTranslation,
      renderBackButton: false,
    };

    expect(actual).toEqual(expected);
  });

  test('given a headerTitleKey and renderBackButton: returns an object with translated headerTitle and provided renderBackButton', () => {
    const headerTitleKey = 'greeting';
    const renderBackButton = true;
    const expectedTranslation = 'Hello';
    const middleware = { t, otherData: 'data' };

    const actual = withHeaderProps({ headerTitleKey, renderBackButton })(
      middleware,
    );
    const expected = {
      t,
      otherData: 'data',
      headerTitle: expectedTranslation,
      renderBackButton,
    };

    expect(actual).toEqual(expected);
  });
});

describe('withInviteLinkToken()', () => {
  test('given a request with token query param: adds the token to the middleware', () => {
    const token = createPopulatedOrganizationInviteLink().token;
    const request = new Request(`http://example.com/?token=${token}`);
    const middleware = { request, otherData: 'data' };

    const actual = withInviteLinkToken(middleware);
    const expected = { request, otherData: 'data', token };

    expect(actual).toEqual(expected);
  });

  test('given a request without a token query param: adds an empty token to the middleware', () => {
    const request = new Request('http://example.com');

    const middleware = { request, otherData: 'data' };

    const actual = withInviteLinkToken(middleware);
    const expected = { request, otherData: 'data', token: '' };

    expect(actual).toEqual(expected);
  });
});
