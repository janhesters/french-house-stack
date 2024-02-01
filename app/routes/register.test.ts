import { faker } from '@faker-js/faker';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { retrieveinviteLinkUseFromDatabaseByUserIdAndLinkId } from '~/features/organizations/invite-link-uses-model.server';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { createPopulatedOrganizationInviteLink } from '~/features/organizations/organizations-factories.server';
import { saveOrganizationInviteLinkToDatabase } from '~/features/organizations/organizations-invite-link-model.server';
import { retrieveOrganizationMembershipFromDatabaseByUserIdAndOrganizationId } from '~/features/organizations/organizations-model.server';
import { magicAdmin } from '~/features/user-authentication/magic-admin.server';
import { retrieveActiveUserAuthSessionFromDatabaseByUserProfileId } from '~/features/user-authentication/user-auth-session-model.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  retrieveFirstUserProfileFromDatabaseByEmail,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import {
  createAuthenticatedRequest,
  setupUserWithOrgAndAddAsMember,
  teardownOrganizationAndMember,
} from '~/test/test-utils';
import { toFormData } from '~/utils/to-form-data';
import { getToast } from '~/utils/toast.server';

import { action } from './register';

const createUrl = (token?: string) =>
  `http://localhost:3000/register${token ? `?token=${token}` : ''}`;

async function sendRequest({
  formData,
  token,
}: {
  formData: FormData;
  token?: string;
}) {
  const request = new Request(createUrl(token), {
    method: 'POST',
    body: formData,
  });

  return await action({ request, context: {}, params: {} });
}

describe('/register route action', () => {
  test('given an authenticated request: redirects to the organizations page', async () => {
    expect.assertions(2);

    const userProfile = createPopulatedUserProfile();
    await saveUserProfileToDatabase(userProfile);
    const request = await createAuthenticatedRequest({
      url: createUrl(),
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
                "Invalid discriminator value. Expected 'emailRegistration' | 'magicEmailRegistration'",
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
                "Invalid discriminator value. Expected 'emailRegistration' | 'magicEmailRegistration'",
              type: 'manual',
            },
          },
          message: 'Bad Request',
        });
      }
    }
  });

  describe('email registration intent', () => {
    const intent = 'emailRegistration';

    test('given a valid email for a user that does NOT exist: returns a response with the email', async () => {
      const { email } = createPopulatedUserProfile();
      const formData = toFormData({ acceptedTerms: 'true', email, intent });

      const response = await sendRequest({ formData });

      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({ email });
    });

    test('given unaccepted terms: returns a response with a 400 status code and an error message about the unaccepted terms', async () => {
      expect.assertions(2);

      const { email } = createPopulatedUserProfile();
      const formData = toFormData({ acceptedTerms: 'false', email, intent });

      try {
        await sendRequest({ formData });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(400);
          expect(await error.json()).toEqual({
            errors: {
              acceptedTerms: {
                message: 'register:terms-must-be-accepted',
                type: 'manual',
              },
            },
            message: 'Bad Request',
          });
        }
      }
    });

    test('given an invalid email: returns a response with a 400 status code and an error message about the invalid email', async () => {
      expect.assertions(2);

      const formData = toFormData({
        acceptedTerms: 'true',
        email: 'invalid-email',
        intent,
      });

      try {
        await sendRequest({ formData });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(400);
          expect(await error.json()).toEqual({
            errors: {
              email: {
                message: 'register:email-invalid',
                type: 'manual',
              },
            },
            message: 'Bad Request',
          });
        }
      }
    });

    test('given a vaild email for a user that already exists: returns a response with a 409 status code and an error asking the user to log in instead', async () => {
      const user = createPopulatedUserProfile();
      await saveUserProfileToDatabase(user);
      const formData = toFormData({
        acceptedTerms: 'true',
        email: user.email,
        intent,
      });

      const response = await sendRequest({ formData });

      expect(response.status).toEqual(409);
      expect(await response.json()).toEqual({
        errors: {
          email: { message: 'register:user-already-exists', type: 'manual' },
        },
        message: 'Conflict',
      });

      await deleteUserProfileFromDatabaseById(user.id);
    });
  });

  describe('magic email registration intent', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    const intent = 'magicEmailRegistration';

    test('given a valid DID token: creates a user profile, redirects to the onboarding page and logs the user in by creating a session and attaching an authentication cookie to the request', async () => {
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

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual('/onboarding');
      expect(response.headers.get('Set-Cookie')).toMatch(
        '__user-authentication-session=ey',
      );

      const createdUserProfile =
        await retrieveFirstUserProfileFromDatabaseByEmail(userProfile.email);
      expect(createdUserProfile?.did).toEqual(userProfile.did);
      expect(createdUserProfile?.acceptedTermsAndConditions).toEqual(true);

      const userAuthenticationSession =
        await retrieveActiveUserAuthSessionFromDatabaseByUserProfileId(
          createdUserProfile!.id,
        );
      expect(userAuthenticationSession).toBeDefined();

      await deleteUserProfileFromDatabaseById(createdUserProfile!.id);
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
                message: 'register:did-token-missing',
                type: 'manual',
              },
            },
            message: 'Bad Request',
          });
        }
      }
    });

    test('given a valid DID token, but the user already exists (e.g. due to a race condition): returns a response with a 409 status code and an error message that the registration failed', async () => {
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

      expect(response.status).toEqual(400);
      expect(await response.json()).toEqual({
        errors: {
          email: { message: 'register:registration-failed', type: 'manual' },
        },
        message: 'Bad Request',
      });

      await deleteUserProfileFromDatabaseById(userProfile.id);
    });

    test('given a valid DID and a valid invite link token in the query string: creates a user profile, adds the user as a member to the organization for the invite link, redirects to the user-profile onboarding page, shows a toast that the user successfully joined the organization and logs the user in by creating a session and attaching an authentication cookie to the request', async () => {
      const userProfile = createPopulatedUserProfile();

      vi.spyOn(magicAdmin.users, 'getMetadataByToken').mockResolvedValue({
        email: userProfile.email,
        issuer: userProfile.did,
        phoneNumber: faker.phone.number(),
        publicAddress: faker.finance.ethereumAddress(),
        oauthProvider: faker.internet.domainName(),
        wallets: [],
      });

      const { organization, user } = await setupUserWithOrgAndAddAsMember();
      const inviteLink = createPopulatedOrganizationInviteLink({
        creatorId: user.id,
        organizationId: organization.id,
      });
      await saveOrganizationInviteLinkToDatabase(inviteLink);
      const formData = toFormData({ didToken: userProfile.did, intent });

      const response = await sendRequest({ formData, token: inviteLink.token });

      // It redirects to the user profile onboarding page.
      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual(
        '/onboarding/user-profile',
      );
      expect(response.headers.get('Set-Cookie')).toMatch(
        '__user-authentication-session=ey',
      );

      // It creates a user profile.
      const createdUserProfile =
        await retrieveFirstUserProfileFromDatabaseByEmail(userProfile.email);
      expect(createdUserProfile?.did).toEqual(userProfile.did);
      expect(createdUserProfile?.acceptedTermsAndConditions).toEqual(true);

      // It shows a toast.
      const maybeHeaders = response.headers.get('Set-Cookie');
      const { toast } = await getToast(
        new Request(createUrl(inviteLink.token), {
          headers: { cookie: maybeHeaders ?? '' },
        }),
      );
      expect(toast).toMatchObject({
        id: expect.any(String),
        title: 'Successfully joined organization',
        description: `You are now a member of ${organization.name}`,
        type: 'success',
      });

      // It adds the user to the organization from the invite link.
      const updatedOrganization =
        await retrieveOrganizationMembershipFromDatabaseByUserIdAndOrganizationId(
          { userId: createdUserProfile!.id, organizationId: organization.id },
        );
      expect(updatedOrganization).toMatchObject({
        deactivatedAt: null,
        role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      });

      // It creates an invite link use for the invite link.
      const inviteLinkUse =
        await retrieveinviteLinkUseFromDatabaseByUserIdAndLinkId({
          inviteLinkId: inviteLink.id,
          userId: createdUserProfile!.id,
        });
      expect(inviteLinkUse).toMatchObject({
        inviteLinkId: inviteLink.id,
        userId: createdUserProfile!.id,
      });

      // It logs the user in via cookie.
      const userAuthenticationSession =
        await retrieveActiveUserAuthSessionFromDatabaseByUserProfileId(
          createdUserProfile!.id,
        );
      expect(userAuthenticationSession).toBeDefined();

      await deleteUserProfileFromDatabaseById(createdUserProfile!.id);
      await teardownOrganizationAndMember({ organization, user });
    });

    test('given a valid DID, but an invalid invite link token in the query string: creates a user profile, redirects to the onboarding page with a toast message about the invalid token, and logs the user in by creating a session and attaching an authentication cookie to the request', async () => {
      const userProfile = createPopulatedUserProfile();

      vi.spyOn(magicAdmin.users, 'getMetadataByToken').mockResolvedValue({
        email: userProfile.email,
        issuer: userProfile.did,
        phoneNumber: faker.phone.number(),
        publicAddress: faker.finance.ethereumAddress(),
        oauthProvider: faker.internet.domainName(),
        wallets: [],
      });

      const { token } = createPopulatedOrganizationInviteLink();
      const formData = toFormData({ didToken: userProfile.did, intent });

      const response = await sendRequest({ formData, token });

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual('/onboarding');
      expect(response.headers.get('Set-Cookie')).toMatch(
        '__user-authentication-session=ey',
      );

      const createdUserProfile =
        await retrieveFirstUserProfileFromDatabaseByEmail(userProfile.email);
      expect(createdUserProfile?.did).toEqual(userProfile.did);
      expect(createdUserProfile?.acceptedTermsAndConditions).toEqual(true);

      // It shows a toast.
      const maybeHeaders = response.headers.get('Set-Cookie');
      const { toast } = await getToast(
        new Request(createUrl(token), {
          headers: { cookie: maybeHeaders ?? '' },
        }),
      );
      expect(toast).toMatchObject({
        id: expect.any(String),
        title: 'Failed to accept invite',
        description: 'The invite link is invalid or has expired',
        type: 'error',
      });

      const userAuthenticationSession =
        await retrieveActiveUserAuthSessionFromDatabaseByUserProfileId(
          createdUserProfile!.id,
        );
      expect(userAuthenticationSession).toBeDefined();

      await deleteUserProfileFromDatabaseById(createdUserProfile!.id);
    });
  });
});
