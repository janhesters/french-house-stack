import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import type { Factory } from '~/utils/types';

import { createPopulatedOrganization } from '../organizations/organizations-factories.server';
import { createPopulatedUserProfile } from '../user-profile/user-profile-factories.server';
import type { OnboardingUser } from './onboarding-helpers.server';
import {
  getUserIsOnboarded,
  redirectUserToOnboardingStep,
  throwIfUserIsOnboarded,
  throwIfUserNeedsOnboarding,
} from './onboarding-helpers.server';

const createOnboardingUser: Factory<OnboardingUser> = ({
  name = createPopulatedUserProfile().name,
  memberships = [
    {
      role: 'member',
      organization: createPopulatedOrganization(),
      deactivatedAt: null,
    },
  ],
} = {}) => ({ ...createPopulatedUserProfile({ name }), memberships });

describe('getUserIsOnboarded()', () => {
  test('given a user with no memberships and no name: returns false', () => {
    const user = createOnboardingUser({ name: '', memberships: [] });

    const actual = getUserIsOnboarded(user);
    const expected = false;

    expect(actual).toEqual(expected);
  });

  test('given a user with memberships but no name: returns false', () => {
    const user = createOnboardingUser({ name: '' });

    const actual = getUserIsOnboarded(user);
    const expected = false;

    expect(actual).toEqual(expected);
  });

  test('given a user with a name but no memberships: returns false', () => {
    const user = createOnboardingUser({ memberships: [] });

    const actual = getUserIsOnboarded(user);
    const expected = false;

    expect(actual).toEqual(expected);
  });

  test('given a user with both a name and memberships: returns true', () => {
    const user = createOnboardingUser();

    const actual = getUserIsOnboarded(user);
    const expected = true;

    expect(actual).toEqual(expected);
  });
});

describe('throwIfUserIsOnboarded()', () => {
  test('given a user that has neither a name nor is a member of any organizations: returns the user', () => {
    const user = createOnboardingUser({ name: '', memberships: [] });

    const actual = throwIfUserIsOnboarded(user);
    const expected = user;

    expect(actual).toEqual(expected);
  });

  test('given a user that has a name and is a member of an organization: redirects the user to their first organization', () => {
    expect.assertions(2);

    const user = createOnboardingUser();

    try {
      throwIfUserIsOnboarded(user);
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual(
          `/organizations/${user.memberships[0].organization.slug}`,
        );
      }
    }
  });

  test('given a user that is a member of an organization, but has no name: returns the user', () => {
    const user = createOnboardingUser({ name: '' });

    const actual = throwIfUserIsOnboarded(user);
    const expected = user;

    expect(actual).toEqual(expected);
  });

  test('given a user that has a name, but is not a member of an organization: returns the user', () => {
    const user = createOnboardingUser({ name: 'Test User', memberships: [] });

    const actual = throwIfUserIsOnboarded(user);
    const expected = user;

    expect(actual).toEqual(expected);
  });
});

describe('redirectUserToOnboardingStep()', () => {
  describe('user profile onboarding page', () => {
    test('given a request to the user profile onboarding page and a user has neither a name, nor organizations, yet: returns the user', () => {
      const user = createOnboardingUser({ name: '', memberships: [] });
      const url = 'http://localhost:3000/onboarding/user-profile';
      const method = faker.internet.httpMethod();
      const request = new Request(url, { method });

      const actual = redirectUserToOnboardingStep(request)(user);
      const expected = user;

      expect(actual).toEqual(expected);
    });

    test.each([
      faker.internet.url(),
      'http://localhost:3000/onboarding/organization',
    ])(
      'given any other request (to %s) and the user has no name a name, and is NOT a member of any organizations, yet: redirects the user to the organization onboarding page',
      url => {
        expect.assertions(2);

        const user = createOnboardingUser({ name: '', memberships: [] });
        const method = faker.internet.httpMethod();
        const request = new Request(url, { method });

        try {
          redirectUserToOnboardingStep(request)(user);
        } catch (error) {
          if (error instanceof Response) {
            expect(error.status).toEqual(302);
            expect(error.headers.get('Location')).toEqual(
              '/onboarding/user-profile',
            );
          }
        }
      },
    );
  });

  describe('organization onboarding page', () => {
    test('given a request to the organization onboarding page and a user that is NOT a member of any organizations, yet: returns the user', () => {
      const user = createOnboardingUser({ memberships: [] });
      const url = 'http://localhost:3000/onboarding/organization';
      const method = faker.internet.httpMethod();
      const request = new Request(url, { method });

      const actual = redirectUserToOnboardingStep(request)(user);
      const expected = user;

      expect(actual).toEqual(expected);
    });

    test.each([
      faker.internet.url(),
      'http://localhost:3000/onboarding/future-step',
    ])(
      'given any other request (to %s) and a user that is NOT a member of any organizations, yet: redirects the user to the organization onboarding page',
      url => {
        expect.assertions(2);

        const user = createOnboardingUser({ memberships: [] });
        const method = faker.internet.httpMethod();
        const request = new Request(url, { method });

        try {
          redirectUserToOnboardingStep(request)(user);
        } catch (error) {
          if (error instanceof Response) {
            expect(error.status).toEqual(302);
            expect(error.headers.get('Location')).toEqual(
              '/onboarding/organization',
            );
          }
        }
      },
    );
  });
});

describe('throwIfUserNeedsOnboarding()', () => {
  test('given a user that has both a name and is a member of an organization: returns the user', () => {
    const user = createOnboardingUser();

    const actual = throwIfUserNeedsOnboarding(user);
    const expected = user;

    expect(actual).toEqual(expected);
  });

  test('given a user that is not a member of an organization: redirects the user to the onboarding page', () => {
    expect.assertions(2);

    const user = createOnboardingUser({ memberships: [] });

    try {
      throwIfUserNeedsOnboarding(user);
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual('/onboarding');
      }
    }
  });

  test('given a user that has no name: redirects the user to the onboarding page', () => {
    expect.assertions(2);

    const user = createOnboardingUser({ name: '' });

    try {
      throwIfUserNeedsOnboarding(user);
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual('/onboarding');
      }
    }
  });
});
