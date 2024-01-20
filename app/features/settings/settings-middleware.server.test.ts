import { describe, expect, test } from 'vitest';

import { createUserWithOrganizations } from '~/test/test-utils';

import { ORGANIZATION_MEMBERSHIP_ROLES } from '../organizations/organizations-constants';
import { createPopulatedOrganization } from '../organizations/organizations-factories.server';
import { withUsersOwnedOrganizations } from './settings-middleware.server';

describe('withUsersOwnedOrganizations()', () => {
  test('given a middleware with a user that is an owner of an organization: adds a usersOwnedOrganizations [] to the middleware', () => {
    const ownedOrganization = createPopulatedOrganization();
    const user = createUserWithOrganizations({
      memberships: [
        {
          role: ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
          organization: ownedOrganization,
          deactivatedAt: null,
        },
      ],
    });
    const middleware = { user, otherData: 'data' };

    const actual = withUsersOwnedOrganizations(middleware);
    const expected = {
      user,
      otherData: 'data',
      usersOwnedOrganizations: [ownedOrganization],
    };

    expect(actual).toEqual(expected);
  });

  test('given a middleware with a user that is not an owner of any organization: adds a userIsOwner boolean to the middleware', () => {
    const user = createUserWithOrganizations();
    const middleware = { user, otherData: 'data' };

    const actual = withUsersOwnedOrganizations(middleware);
    const expected = { user, otherData: 'data', usersOwnedOrganizations: [] };

    expect(actual).toEqual(expected);
  });
});
