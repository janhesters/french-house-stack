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
import { getToast } from '~/utils/toast.server';

import { action } from './settings.profile';

const url = 'http://localhost:3000/settings/profile';

const createBody = ({
  intent = 'update',
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

describe('/settings/profile route action', () => {
  test('given an unauthenticated request: should throw a redirect response to the login page', async () => {
    expect.assertions(2);

    const request = new Request(url, { method: 'POST' });

    try {
      await action({ request, context: {}, params: {} });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual(
          `/login?redirectTo=%2Fsettings%2Fprofile`,
        );
      }
    }
  });

  describe('update intent', () => {
    const intent = 'update';

    test("given a valid name: updates the user's name and shows a toast", async () => {
      const { organization, user } = await setupUserWithOrgAndAddAsMember();
      const body = createBody({ intent });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
      });

      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({ success: true });

      // It updates the user's name.
      const updatedUser = await retrieveUserProfileFromDatabaseById(user.id);
      expect(updatedUser?.name).toEqual(body.name);

      // It shows a toast.
      const maybeHeaders = response.headers.get('Set-Cookie');
      const { toast } = await getToast(
        new Request(url, { headers: { cookie: maybeHeaders ?? '' } }),
      );
      expect(toast).toMatchObject({
        id: expect.any(String),
        title: 'Profile has been updated',
        type: 'message',
      });

      await teardownOrganizationAndMember({ organization, user });
    });

    test.each([
      {
        name: faker.string.alpha({ length: 1 }),
        reason: 'the name is too short',
        expectedError: 'settings-user-profile:name-min-length',
      },
      {
        name: '   .   ',
        reason:
          'the name is technically long enough, but contains empty spaces',
        expectedError: 'settings-user-profile:name-min-length',
      },
      {
        name: faker.string.alpha({ length: 129 }),
        reason: 'the name is too long',
        expectedError: 'settings-user-profile:name-max-length',
      },
    ])(
      'given invalid form data, e.g. $reason: returns a 400',
      async ({ name, expectedError }) => {
        expect.assertions(2);

        const { organization, user } = await setupUserWithOrgAndAddAsMember();

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

        await teardownOrganizationAndMember({ organization, user });
      },
    );

    test('given a user who lacks a name but has organizations: redirects the user to the user profile onboarding page', async () => {
      expect.assertions(2);

      const { user, organization } = await setupUserWithOrgAndAddAsMember({
        user: createPopulatedUserProfile({ name: '' }),
      });
      const body = createBody({ intent });

      try {
        await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(body),
        });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(302);
          expect(error.headers.get('Location')).toEqual('/onboarding');
        }
      }

      await teardownOrganizationAndMember({ user, organization });
    });

    test('given a user who has a name but lacks organizations: redirects the user to the organization onboarding page', async () => {
      expect.assertions(2);

      const user = createPopulatedUserProfile();
      await saveUserProfileToDatabase(user);
      const body = createBody({ intent });

      try {
        await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(body),
        });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(302);
          expect(error.headers.get('Location')).toEqual('/onboarding');
        }
      }

      await deleteUserProfileFromDatabaseById(user.id);
    });
  });
});
