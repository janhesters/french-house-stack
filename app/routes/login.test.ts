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
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import {
  createAuthenticatedRequest,
  setupUserWithOrgAndAddAsMember,
  teardownOrganizationAndMember,
} from '~/test/test-utils';
import { toFormData } from '~/utils/to-form-data';
import { getToast } from '~/utils/toast.server';

import { action } from './login';

const createUrl = (token?: string) =>
  `http://localhost:3000/login${token ? `?token=${token}` : ''}`;

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

describe('/login route action', () => {
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

    test("given a valid DID token and the user is a member of an organization: redirects to the user's first organization's page and logs the user in by creating a session and attaching an authentication cookie to the request", async () => {
      const { organization, user } = await setupUserWithOrgAndAddAsMember();

      vi.spyOn(magicAdmin.users, 'getMetadataByToken').mockResolvedValue({
        email: user.email,
        issuer: user.did,
        phoneNumber: faker.phone.number(),
        publicAddress: faker.finance.ethereumAddress(),
        oauthProvider: faker.internet.domainName(),
        wallets: [],
      });

      const formData = toFormData({ didToken: user.did, intent });

      const response = await sendRequest({ formData });

      expect(response.status).toEqual(302);
      expect(response.headers.get('location')).toEqual(
        `/organizations/${organization.slug}/home`,
      );
      expect(response.headers.get('Set-Cookie')).toMatch(
        '__user-authentication-session=ey',
      );

      const userAuthenticationSession =
        await retrieveActiveUserAuthSessionFromDatabaseByUserProfileId(user.id);
      expect(userAuthenticationSession).toBeDefined();

      await teardownOrganizationAndMember({ organization, user });
    });

    test('given a valid DID token and the user is NOT a member of any organization: redirects to the onboarding page and logs the user in by creating a session and attaching an authentication cookie to the request', async () => {
      const user = createPopulatedUserProfile();
      await saveUserProfileToDatabase(user);

      vi.spyOn(magicAdmin.users, 'getMetadataByToken').mockResolvedValue({
        email: user.email,
        issuer: user.did,
        phoneNumber: faker.phone.number(),
        publicAddress: faker.finance.ethereumAddress(),
        oauthProvider: faker.internet.domainName(),
        wallets: [],
      });

      const formData = toFormData({ didToken: user.did, intent });

      const response = await sendRequest({ formData });

      expect(response.status).toEqual(302);
      expect(response.headers.get('location')).toEqual('/onboarding');
      expect(response.headers.get('Set-Cookie')).toMatch(
        '__user-authentication-session=ey',
      );

      const userAuthenticationSession =
        await retrieveActiveUserAuthSessionFromDatabaseByUserProfileId(user.id);
      expect(userAuthenticationSession).toBeDefined();

      await deleteUserProfileFromDatabaseById(user.id);
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

    test("given a valid DID token, and a valid invite token in the query string for an organization that the user is NOT yet a member of: redirects to the organizations page, displays a toast that the user successfully joined the organization, adds the user to the invite link's organization and logs the user in by creating a session and attaching an authentication cookie to the request", async () => {
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

      const { organization, user } = await setupUserWithOrgAndAddAsMember();
      const inviteLink = createPopulatedOrganizationInviteLink({
        creatorId: user.id,
        organizationId: organization.id,
      });
      await saveOrganizationInviteLinkToDatabase(inviteLink);
      const formData = toFormData({ didToken: userProfile.did, intent });

      const response = await sendRequest({ formData, token: inviteLink.token });

      expect(response.status).toEqual(302);
      expect(response.headers.get('location')).toEqual(
        `/organizations/${organization.slug}/home`,
      );
      expect(response.headers.get('Set-Cookie')).toMatch(
        '__user-authentication-session=ey',
      );

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
          { userId: userProfile.id, organizationId: organization.id },
        );
      expect(updatedOrganization).toMatchObject({
        deactivatedAt: null,
        role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      });

      // It creates an invite link use for the invite link.
      const inviteLinkUse =
        await retrieveinviteLinkUseFromDatabaseByUserIdAndLinkId({
          inviteLinkId: inviteLink.id,
          userId: userProfile.id,
        });
      expect(inviteLinkUse).toMatchObject({
        inviteLinkId: inviteLink.id,
        userId: userProfile.id,
      });

      // It logs the user in via cookie.
      const userAuthenticationSession =
        await retrieveActiveUserAuthSessionFromDatabaseByUserProfileId(
          userProfile.id,
        );
      expect(userAuthenticationSession).toBeDefined();

      await deleteUserProfileFromDatabaseById(userProfile.id);
      await teardownOrganizationAndMember({ organization, user });
    });

    test('given a valid did token and a valid invite token in the query string for an organization that the user is already a member of: redirects to the organizations page, displays a toast that the user is already a member of the organization and logs the user in by creating a session and attaching an authentication cookie to the request', async () => {
      const { organization, user } = await setupUserWithOrgAndAddAsMember();

      vi.spyOn(magicAdmin.users, 'getMetadataByToken').mockResolvedValue({
        email: user.email,
        issuer: user.did,
        phoneNumber: faker.phone.number(),
        publicAddress: faker.finance.ethereumAddress(),
        oauthProvider: faker.internet.domainName(),
        wallets: [],
      });

      const inviteLink = createPopulatedOrganizationInviteLink({
        creatorId: user.id,
        organizationId: organization.id,
      });
      await saveOrganizationInviteLinkToDatabase(inviteLink);
      const formData = toFormData({ didToken: user.did, intent });

      const response = await sendRequest({ formData, token: inviteLink.token });

      expect(response.status).toEqual(302);
      expect(response.headers.get('location')).toEqual(
        `/organizations/${organization.slug}/home`,
      );
      expect(response.headers.get('Set-Cookie')).toMatch(
        '__user-authentication-session=ey',
      );

      // It shows a toast.
      const maybeHeaders = response.headers.get('Set-Cookie');
      const { toast } = await getToast(
        new Request(createUrl(inviteLink.token), {
          headers: { cookie: maybeHeaders ?? '' },
        }),
      );
      expect(toast).toMatchObject({
        id: expect.any(String),
        title: 'Already a member',
        description: `You are already a member of ${organization.name}`,
        type: 'info',
      });

      // It logs the user in via cookie.
      const userAuthenticationSession =
        await retrieveActiveUserAuthSessionFromDatabaseByUserProfileId(user.id);
      expect(userAuthenticationSession).toBeDefined();

      await teardownOrganizationAndMember({ organization, user });
    });

    test("given a valid did token and an invalid invite token: redirects to the user's first organization's page, shows a toast message about the invalid token and logs the user in by creating a session and attaching an authentication cookie to the request", async () => {
      const { organization, user } = await setupUserWithOrgAndAddAsMember();

      vi.spyOn(magicAdmin.users, 'getMetadataByToken').mockResolvedValue({
        email: user.email,
        issuer: user.did,
        phoneNumber: faker.phone.number(),
        publicAddress: faker.finance.ethereumAddress(),
        oauthProvider: faker.internet.domainName(),
        wallets: [],
      });

      const formData = toFormData({ didToken: user.did, intent });

      const response = await sendRequest({
        formData,
        token: 'invalid-token',
      });

      expect(response.status).toEqual(302);
      expect(response.headers.get('location')).toEqual(
        `/organizations/${organization.slug}/home`,
      );
      expect(response.headers.get('Set-Cookie')).toMatch(
        '__user-authentication-session=ey',
      );

      // It shows a toast.
      const maybeHeaders = response.headers.get('Set-Cookie');
      const { toast } = await getToast(
        new Request(createUrl('invalid-token'), {
          headers: { cookie: maybeHeaders ?? '' },
        }),
      );
      expect(toast).toMatchObject({
        id: expect.any(String),
        title: 'Failed to accept invite',
        description: 'The invite link is invalid or has expired',
        type: 'error',
      });

      // It logs the user in via cookie.
      const userAuthenticationSession =
        await retrieveActiveUserAuthSessionFromDatabaseByUserProfileId(user.id);
      expect(userAuthenticationSession).toBeDefined();

      await teardownOrganizationAndMember({ organization, user });
    });
  });
});
