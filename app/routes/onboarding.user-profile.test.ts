import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  retrieveUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import {
  createAuthenticatedRequest,
  setupUserWithOrgAndAddAsMember,
  teardownOrganizationAndMember,
} from '~/test/test-utils';
import { toFormData } from '~/utils/to-form-data';

import { action } from './onboarding.user-profile';

const url = 'http://localhost:3000/onboarding/user-profile';

const createBody = ({
  intent = 'create',
  name = createPopulatedUserProfile().name,
} = {}) => ({ intent, name });

async function sendAuthenticatedRequest({
  userId,
  formData = toFormData(createBody()),
}: {
  userId: string;
  formData?: FormData;
}) {
  const request = await createAuthenticatedRequest({ url, userId, formData });
  return await action({ request, context: {}, params: {} });
}

async function setup({ user = createPopulatedUserProfile({ name: '' }) } = {}) {
  await saveUserProfileToDatabase(user);
  return { user };
}

describe('/onboarding/user-profile route action', () => {
  test('given an unauthenticated request: should throw a redirect response to the login page', async () => {
    expect.assertions(2);

    const request = new Request(url, { method: 'POST' });

    try {
      await action({ request, context: {}, params: {} });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual(
          `/login?redirectTo=%2Fonboarding%2Fuser-profile`,
        );
      }
    }
  });

  describe('create intent', () => {
    const intent = 'create';

    test("given a valid name: updates the user's name and redirects to the organization onboarding page", async () => {
      const { user } = await setup();
      const body = createBody({ intent });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
      });

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual(
        '/onboarding/organization',
      );

      // It updates the user's name.
      const updatedUser = await retrieveUserProfileFromDatabaseById(user.id);
      expect(updatedUser?.name).toEqual(body.name);

      await deleteUserProfileFromDatabaseById(user.id);
    });

    test('given a user who lacks a name but has organizations: updates the users name and redirects to the onboarding organization page (which will likely redirect further)', async () => {
      const { user, organization } = await setupUserWithOrgAndAddAsMember({
        user: createPopulatedUserProfile({ name: '' }),
      });
      const body = createBody({ intent });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
      });

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual(
        `/onboarding/organization`,
      );

      // It updates the users name.
      const updatedUser = await retrieveUserProfileFromDatabaseById(user.id);
      expect(updatedUser?.acceptedTermsAndConditions).toEqual(true);
      expect(updatedUser?.name).toEqual(body.name);

      await teardownOrganizationAndMember({ user, organization });
    });

    test.each([
      {
        name: faker.string.alpha({ length: 1 }),
        reason: 'the name is too short',
        expectedError: 'onboarding-user-profile:name-min-length',
      },
      {
        name: '   .   ',
        reason:
          'the name is technically long enough, but contains empty spaces',
        expectedError: 'onboarding-user-profile:name-min-length',
      },
      {
        name: faker.string.alpha({ length: 129 }),
        reason: 'the name is too long',
        expectedError: 'onboarding-user-profile:name-max-length',
      },
    ])(
      'given invalid form data, e.g. $reason: returns a 400',
      async ({ name, expectedError }) => {
        expect.assertions(2);

        const { user } = await setup();

        try {
          await sendAuthenticatedRequest({
            userId: user.id,
            formData: toFormData(createBody({ intent, name })),
          });
        } catch (error) {
          if (error instanceof Response) {
            expect(error.status).toEqual(400);
            expect(await error.json()).toEqual({
              errors: { name: { message: expectedError, type: 'manual' } },
              message: 'Bad Request',
            });
          }
        }

        await deleteUserProfileFromDatabaseById(user.id);
      },
    );

    test('given the user has a name and is no member of any organization: redirects the user to the organization onboarding page', async () => {
      expect.assertions(2);

      const { user } = await setup({ user: createPopulatedUserProfile() });

      try {
        await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(createBody({ intent })),
        });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(302);
          expect(error.headers.get('Location')).toEqual(
            '/onboarding/organization',
          );
        }
      }

      await deleteUserProfileFromDatabaseById(user.id);
    });

    test("given the user has a name and is a member of an organization: redirects the user to their first organization's page", async () => {
      expect.assertions(2);

      const { user, organization } = await setupUserWithOrgAndAddAsMember();

      try {
        await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(createBody({ intent })),
        });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(302);
          expect(error.headers.get('Location')).toEqual(
            `/organizations/${organization.slug}`,
          );
        }
      }

      await teardownOrganizationAndMember({ user, organization });
    });
  });
});
