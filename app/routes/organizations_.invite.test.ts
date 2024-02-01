import type { Organization, UserProfile } from '@prisma/client';
import { describe, expect, test } from 'vitest';

import { retrieveinviteLinkUseFromDatabaseByUserIdAndLinkId } from '~/features/organizations/invite-link-uses-model.server';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { createPopulatedOrganizationInviteLink } from '~/features/organizations/organizations-factories.server';
import { saveOrganizationInviteLinkToDatabase } from '~/features/organizations/organizations-invite-link-model.server';
import { retrieveOrganizationMembershipFromDatabaseByUserIdAndOrganizationId } from '~/features/organizations/organizations-model.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import {
  createAuthenticatedRequest,
  setupUserWithOrgAndAddAsMember,
  teardownOrganizationAndMember,
  toFormData,
} from '~/test/test-utils';
import { getToast } from '~/utils/toast.server';

import { action } from './organizations_.invite';

const createUrl = (token?: string) =>
  `http://localhost:3000/organizations/invite${token ? `?token=${token}` : ''}`;

const createBody = ({ intent = 'acceptInvite' } = {}) => ({ intent });

async function sendRequest({
  formData = toFormData(createBody()),
  token,
}: {
  formData?: FormData;
  token?: string;
}) {
  const url = createUrl(token);
  const request = new Request(url, { method: 'POST', body: formData });

  return await action({ request, context: {}, params: {} });
}

async function sendAuthenticatedRequest({
  userId,
  formData = toFormData(createBody()),
  token,
}: {
  userId: string;
  formData?: FormData;
  token?: string;
}) {
  const url = createUrl(token);
  const request = await createAuthenticatedRequest({ url, userId, formData });

  return await action({ request, context: {}, params: {} });
}

async function setup() {
  const { organization, user } = await setupUserWithOrgAndAddAsMember();
  const { organization: otherOrganization, user: otherUser } =
    await setupUserWithOrgAndAddAsMember();
  const inviteLink = createPopulatedOrganizationInviteLink({
    organizationId: otherOrganization.id,
    creatorId: otherUser.id,
  });
  await saveOrganizationInviteLinkToDatabase(inviteLink);
  return { inviteLink, organization, otherOrganization, otherUser, user };
}

async function teardown({
  organization,
  otherOrganization,
  otherUser,
  user,
}: {
  organization: Organization;
  otherOrganization: Organization;
  otherUser: UserProfile;
  user: UserProfile;
}) {
  await teardownOrganizationAndMember({ organization, user });
  await teardownOrganizationAndMember({
    organization: otherOrganization,
    user: otherUser,
  });
}

describe('organizations_.invite', () => {
  describe('anonymous request', () => {
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
                message: 'Invalid literal value, expected "acceptInvite"',
                type: 'manual',
              },
            },
            message: 'Bad Request',
          });
        }
      }
    });

    test('given no token: returns a 400 response with a toast message about the missing token', async () => {
      const response = await sendRequest({});

      expect(response.status).toEqual(400);
      expect(await response.json()).toEqual({
        error: 'Invalid token',
        message: 'Bad Request',
      });

      // It shows a toast.
      const maybeHeaders = response.headers.get('Set-Cookie');
      const { toast } = await getToast(
        new Request(createUrl(), {
          headers: { cookie: maybeHeaders ?? '' },
        }),
      );
      expect(toast).toMatchObject({
        id: expect.any(String),
        title: 'Failed to accept invite',
        description: 'The invite link is invalid or has expired',
        type: 'error',
      });
    });

    test('given an invalid token: returns a 400 response with a toast message about the invalid token', async () => {
      const { token } = createPopulatedOrganizationInviteLink();

      const response = await sendRequest({ token });

      expect(response.status).toEqual(400);
      expect(await response.json()).toEqual({
        error: 'Invalid token',
        message: 'Bad Request',
      });

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
    });

    test('given a valid token: redirects to the register page with a toast message about the valid invite link', async () => {
      const {
        inviteLink: { token },
        organization,
        otherOrganization,
        otherUser,
        user,
      } = await setup();

      const response = await sendRequest({ token });

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual(
        `/register?token=${token}`,
      );

      // It shows a toast.
      const maybeHeaders = response.headers.get('Set-Cookie');
      const { toast } = await getToast(
        new Request(createUrl(token), {
          headers: { cookie: maybeHeaders ?? '' },
        }),
      );
      expect(toast).toMatchObject({
        id: expect.any(String),
        title: 'Invitation link is valid',
        description: 'Please register or log in to accept the invitation',
        type: 'info',
      });

      await teardown({ organization, otherOrganization, otherUser, user });
    });
  });

  describe('authenticated request', () => {
    test('given an invalid intent: returns a response with a 400 status code and an error message about the invalid intent', async () => {
      expect.assertions(2);

      const user = createPopulatedUserProfile();
      await saveUserProfileToDatabase(user);
      const formData = toFormData({ intent: 'invalid-intent' });

      try {
        await sendAuthenticatedRequest({
          userId: user.id,
          formData,
        });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(400);
          expect(await error.json()).toEqual({
            errors: {
              intent: {
                message: 'Invalid literal value, expected "acceptInvite"',
                type: 'manual',
              },
            },
            message: 'Bad Request',
          });
        }
      }

      await deleteUserProfileFromDatabaseById(user.id);
    });

    test('given an invalid token: returns a 400 response with a toast message about the invalid token', async () => {
      const user = createPopulatedUserProfile();
      await saveUserProfileToDatabase(user);
      const { token } = createPopulatedOrganizationInviteLink();

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        token,
      });

      expect(response.status).toEqual(400);
      expect(await response.json()).toEqual({
        error: 'Invalid token',
        message: 'Bad Request',
      });

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

      await deleteUserProfileFromDatabaseById(user.id);
    });

    test("given a valid token for an organization that the user is NOT a member of: redirects to the organization's page with a toast that the user successfully joined the organization, and adds them as a member to the organization", async () => {
      const { inviteLink, organization, otherOrganization, otherUser, user } =
        await setup();

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        token: inviteLink.token,
      });

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual(
        `/organizations/${otherOrganization.slug}/home`,
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
        description: `You are now a member of ${otherOrganization.name}`,
        type: 'success',
      });

      // It adds the user to the organization as a member.
      const updatedOrganization =
        await retrieveOrganizationMembershipFromDatabaseByUserIdAndOrganizationId(
          { userId: user.id, organizationId: otherOrganization.id },
        );
      expect(updatedOrganization).toMatchObject({
        deactivatedAt: null,
        role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      });

      // It creates an invite link use for the invite link.
      const inviteLinkUse =
        await retrieveinviteLinkUseFromDatabaseByUserIdAndLinkId({
          inviteLinkId: inviteLink.id,
          userId: user.id,
        });
      expect(inviteLinkUse).toMatchObject({
        inviteLinkId: inviteLink.id,
        userId: user.id,
      });

      await teardown({ organization, otherOrganization, otherUser, user });
    });

    test('given a valid token, but the user is already a member for the organization: redirects to the users organization and displays a toast that they are already a member', async () => {
      const { organization, user } = await setupUserWithOrgAndAddAsMember();
      const inviteLink = createPopulatedOrganizationInviteLink({
        organizationId: organization.id,
        creatorId: user.id,
      });
      await saveOrganizationInviteLinkToDatabase(inviteLink);

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        token: inviteLink.token,
      });

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual(
        `/organizations/${organization.slug}/home`,
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

      await teardownOrganizationAndMember({ organization, user });
    });
  });
});
