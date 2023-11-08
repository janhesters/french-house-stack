import { faker } from '@faker-js/faker';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { magicAdmin } from '~/features/user-authentication/magic-admin.server';
import { retrieveActiveUserAuthSessionFromDatabaseByUserProfileId } from '~/features/user-authentication/user-auth-session-model.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import { createAuthenticatedRequest } from '~/test/test-utils';
import { toFormData } from '~/utils/to-form-data';

import { action } from './login';

const url = 'http://localhost:3000/login';

async function sendRequest({ formData }: { formData: FormData }) {
  const request = new Request(url, { method: 'POST', body: formData });

  return action({ request, context: {}, params: {} });
}

describe('/login route action', () => {
  test('given an authenticated request: redirects to the organizations page', async () => {
    expect.assertions(2);

    const userProfile = createPopulatedUserProfile();
    await saveUserProfileToDatabase(userProfile);
    const request = await createAuthenticatedRequest({
      url,
      userId: userProfile.id,
      method: 'POST',
      formData: toFormData({}),
    });

    try {
      await action({ request, context: {}, params: {} });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual('/organizations');
      }
    }

    await deleteUserProfileFromDatabaseById(userProfile.id);
  });

  test('given an invalid intent: returns a response with a 400 status code and an error message about the invalid intent', async () => {
    expect.assertions(2);

    const formData = toFormData({ intent: 'invalid-intent' });

    try {
      await sendRequest({ formData });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(400);
        expect(await error.json()).toEqual({
          errors: {
            intent: {
              message:
                "Invalid discriminator value. Expected 'emailLogin' | 'magicEmailLogin'",
              type: 'manual',
            },
          },
          message: 'Bad Request',
        });
      }
    }
  });

  test('given no intent: returns a response with a 400 status code and an error message about the missing intent', async () => {
    expect.assertions(2);

    const formData = toFormData({});

    try {
      await sendRequest({ formData });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(400);
        expect(await error.json()).toEqual({
          errors: {
            intent: {
              message:
                "Invalid discriminator value. Expected 'emailLogin' | 'magicEmailLogin'",
              type: 'manual',
            },
          },
          message: 'Bad Request',
        });
      }
    }
  });

  describe('email login intent', () => {
    const intent = 'emailLogin';

    test('given a valid email for an email with a user profile associated to it: returns the email', async () => {
      const userProfile = createPopulatedUserProfile();
      await saveUserProfileToDatabase(userProfile);

      const formData = toFormData({ email: userProfile.email, intent });

      const response = await sendRequest({ formData });

      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({ email: userProfile.email });

      await deleteUserProfileFromDatabaseById(userProfile.id);
    });

    test('given a valid email for an email without a user profile associated to it: returns a response with a 400 status code and an error message asking the user to register instead', async () => {
      expect.assertions(2);

      const formData = toFormData({ email: faker.internet.email(), intent });

      const response = await sendRequest({ formData });

      expect(response.status).toEqual(400);
      expect(await response.json()).toEqual({
        errors: {
          email: { message: 'login:user-doesnt-exist', type: 'manual' },
        },
        message: 'Bad Request',
      });
    });

    test('given an invalid email: returns a response with a 400 status code and an error message about the invalid email', async () => {
      expect.assertions(2);

      try {
        const formData = toFormData({ email: 'invalid-email', intent });

        await sendRequest({ formData });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(400);
          expect(await error.json()).toEqual({
            errors: {
              email: { message: 'login:email-invalid', type: 'manual' },
            },
            message: 'Bad Request',
          });
        }
      }
    });
  });

  describe('magic email login intent', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    const intent = 'magicEmailLogin';

    test('given a valid DID token: redirects to the organizations page and logs the user in by creating a session and attaching an authentication cookie to the request', async () => {
      const userProfile = createPopulatedUserProfile();
      await saveUserProfileToDatabase(userProfile);

      vi.spyOn(magicAdmin.users, 'getMetadataByToken').mockResolvedValue({
        email: userProfile.email,
        issuer: userProfile.did,
        phoneNumber: faker.phone.number(),
        publicAddress: faker.finance.ethereumAddress(),
        oauthProvider: faker.internet.domainName(),
        wallets: [],
      });

      const formData = toFormData({ didToken: userProfile.did, intent });

      const response = await sendRequest({ formData });

      expect(response.status).toEqual(302);
      expect(response.headers.get('location')).toEqual('/organizations');
      expect(response.headers.get('Set-Cookie')).toMatch(
        '__user-authentication-session=ey',
      );

      const userAuthenticationSession =
        await retrieveActiveUserAuthSessionFromDatabaseByUserProfileId(
          userProfile.id,
        );
      expect(userAuthenticationSession).toBeDefined();

      await deleteUserProfileFromDatabaseById(userProfile.id);
    });

    test('given no DID token: returns a response with a 400 status code and an error message about the missing DID token', async () => {
      expect.assertions(2);

      const formData = toFormData({ intent });

      try {
        await sendRequest({ formData });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(400);
          expect(await error.json()).toEqual({
            errors: {
              didToken: {
                message: 'login:did-token-missing',
                type: 'manual',
              },
            },
            message: 'Bad Request',
          });
        }
      }
    });

    test("given a valid DID token, but the user profile doesn't exist (= i.e. the user has been deleted in a race condition): returns a response with a 400 status code and an error message about the missing user profile", async () => {
      const userProfile = createPopulatedUserProfile();

      vi.spyOn(magicAdmin.users, 'getMetadataByToken').mockResolvedValue({
        email: userProfile.email,
        issuer: userProfile.did,
        phoneNumber: faker.phone.number(),
        publicAddress: faker.finance.ethereumAddress(),
        oauthProvider: faker.internet.domainName(),
        wallets: [],
      });

      const formData = toFormData({ didToken: userProfile.did, intent });

      const response = await sendRequest({ formData });

      expect(response.status).toEqual(400);
      expect(await response.json()).toEqual({
        errors: {
          email: { message: 'login:user-doesnt-exist', type: 'manual' },
        },
        message: 'Bad Request',
      });
    });
  });
});
