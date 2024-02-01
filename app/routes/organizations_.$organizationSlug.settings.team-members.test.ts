import { faker } from '@faker-js/faker';
import { addDays, subSeconds } from 'date-fns';
import { describe, expect, test } from 'vitest';

import type { OrganizationMembershipRole } from '~/features/organizations/organizations-constants';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import {
  createPopulatedOrganization,
  createPopulatedOrganizationInviteLink,
} from '~/features/organizations/organizations-factories.server';
import {
  retrieveLatestInviteLinkFromDatabaseByOrganizationId,
  retrieveOrganizationInviteLinkFromDatabaseById,
  saveOrganizationInviteLinkToDatabase,
} from '~/features/organizations/organizations-invite-link-model.server';
import {
  addMembersToOrganizationInDatabaseById,
  deleteOrganizationFromDatabaseById,
  retrieveOrganizationMembershipFromDatabaseByUserIdAndOrganizationId,
  saveOrganizationToDatabase,
} from '~/features/organizations/organizations-model.server';
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

import { action } from './organizations_.$organizationSlug.settings.team-members';

const createUrl = (slug: string) =>
  `http://localhost:3000/organizations/${slug}/settings/team-members`;

type BodyProps = {
  intent?: string;
  [key: string]: any;
};

const createBody = ({
  intent = 'createNewInviteLink',
  ...rest
}: BodyProps = {}) => ({ intent, ...rest });

async function sendAuthenticatedRequest({
  userId,
  formData,
  organizationSlug,
}: {
  userId: string;
  formData?: FormData;
  organizationSlug: string;
}) {
  const url = createUrl(organizationSlug);
  const request = await createAuthenticatedRequest({ url, userId, formData });
  const params = { organizationSlug };

  const response = await action({ request, context: {}, params });
  return response;
}

function setup(
  role: OrganizationMembershipRole = ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
) {
  return setupUserWithOrgAndAddAsMember({ role });
}

describe('organization_.$organizationSlug.team-members action', () => {
  test('given an unauthenticated request: should throw a redirect response to the login page', async () => {
    expect.assertions(2);

    const { slug } = createPopulatedOrganization();
    const request = new Request(createUrl(slug), { method: 'POST' });

    try {
      await action({ request, context: {}, params: {} });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual(
          `/login?redirectTo=%2Forganizations%2F${slug}%2Fsettings%2Fteam-members`,
        );
      }
    }
  });

  test('given the user is NOT a member of the organization: throws a 404', async () => {
    expect.assertions(1);

    const { user, organization } = await setup();
    const otherOrganization = createPopulatedOrganization();
    await saveOrganizationToDatabase(otherOrganization);

    try {
      await sendAuthenticatedRequest({
        userId: user.id,
        organizationSlug: otherOrganization.slug,
      });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(404);
      }
    }

    await deleteOrganizationFromDatabaseById(otherOrganization.id);
    await teardownOrganizationAndMember({ user, organization });
  });

  test('given invalid form data (invalid intent): throws a 400 with a "invalid-intent" error', async () => {
    expect.assertions(1);

    const { user, organization } = await setup();
    const body = createBody({ intent: 'invalid' });

    try {
      await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
        organizationSlug: organization.slug,
      });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(400);
      }
    }

    await teardownOrganizationAndMember({ user, organization });
  });

  describe('createNewInviteLink intent', () => {
    const intent = 'createNewInviteLink';

    test.each([
      ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
    ])(
      'given valid form data, but the user is a %s: returns a 403 forbidden',
      async role => {
        const { user, organization } = await setup(role);
        const body = createBody({ intent });

        const response = await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(body),
          organizationSlug: organization.slug,
        });

        expect(response.status).toEqual(403);
        expect(await response.json()).toEqual({
          message: 'Forbidden',
          errors: { form: 'you-must-be-an-owner' },
        });

        await teardownOrganizationAndMember({ user, organization });
      },
    );

    test('given no link exists for the organization: creates a new invite link that expires in two days', async () => {
      const { user, organization } = await setup();
      const body = createBody({ intent });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
        organizationSlug: organization.slug,
      });

      expect(response.status).toEqual(201);
      expect(await response.json()).toEqual({ message: 'Created' });

      // It creates a new organization invite link.
      const latestLink =
        await retrieveLatestInviteLinkFromDatabaseByOrganizationId(
          organization.id,
        );
      expect(latestLink?.deactivatedAt).toEqual(null);
      expect(latestLink?.creatorId).toEqual(user.id);

      const expectedExpirationTime = subSeconds(addDays(new Date(), 2), 60);
      expect(latestLink?.expiresAt.getTime()).toBeGreaterThanOrEqual(
        expectedExpirationTime.getTime(),
      );

      await teardownOrganizationAndMember({ user, organization });
    });

    test('given a link already exists for the organization: deactivates the old link and creates a new invite link that expires in two days', async () => {
      const { user, organization } = await setup();
      const existingInviteLink = createPopulatedOrganizationInviteLink({
        organizationId: organization.id,
        creatorId: user.id,
      });
      await saveOrganizationInviteLinkToDatabase(existingInviteLink);
      const body = createBody({ intent });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
        organizationSlug: organization.slug,
      });

      expect(response.status).toEqual(201);
      expect(await response.json()).toEqual({ message: 'Created' });

      // It creates a new organization invite link.
      const latestLink =
        await retrieveLatestInviteLinkFromDatabaseByOrganizationId(
          organization.id,
        );
      expect(latestLink?.deactivatedAt).toEqual(null);
      expect(latestLink?.creatorId).toEqual(user.id);

      const expectedExpirationTime = subSeconds(addDays(new Date(), 2), 60);
      expect(latestLink?.expiresAt.getTime()).toBeGreaterThanOrEqual(
        expectedExpirationTime.getTime(),
      );

      // It deactivates the old link.
      const updatedLink = await retrieveOrganizationInviteLinkFromDatabaseById(
        existingInviteLink.id,
      );
      expect(updatedLink?.deactivatedAt).not.toEqual(null);

      await teardownOrganizationAndMember({ user, organization });
    });
  });

  describe('deactivateInviteLink intent', () => {
    const intent = 'deactivateInviteLink';

    test.each([
      ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
    ])(
      'given valid form data, but the user is a %s: returns a 403 forbidden',
      async role => {
        const { user, organization } = await setup(role);
        const body = createBody({ intent });

        const response = await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(body),
          organizationSlug: organization.slug,
        });

        expect(response.status).toEqual(403);
        expect(await response.json()).toEqual({
          message: 'Forbidden',
          errors: { form: 'you-must-be-an-owner' },
        });

        await teardownOrganizationAndMember({ user, organization });
      },
    );

    test('given no active link exists for the organization: return a 200 and does nothing', async () => {
      const { user, organization } = await setup();
      const body = createBody({ intent });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
        organizationSlug: organization.slug,
      });

      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({ message: 'Ok' });

      await teardownOrganizationAndMember({ user, organization });
    });

    test('given a link exists and is active for the organization: deactivates the link', async () => {
      const { user, organization } = await setup();
      const existingInviteLink = createPopulatedOrganizationInviteLink({
        organizationId: organization.id,
        creatorId: user.id,
      });
      await saveOrganizationInviteLinkToDatabase(existingInviteLink);
      const body = createBody({ intent });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
        organizationSlug: organization.slug,
      });

      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({ message: 'Ok' });

      // It deactivates the old link.
      const updatedLink = await retrieveOrganizationInviteLinkFromDatabaseById(
        existingInviteLink.id,
      );
      expect(updatedLink?.deactivatedAt).not.toEqual(null);

      await teardownOrganizationAndMember({ user, organization });
    });
  });

  describe('changeRole intent', () => {
    const intent = 'changeRole';

    test.each([
      ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
      ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
    ])(
      'given valid data with a role of %s: sets the members role to %s',
      async role => {
        const { user, organization } = await setup();
        const otherUser = createPopulatedUserProfile();
        await saveUserProfileToDatabase(otherUser);
        await addMembersToOrganizationInDatabaseById({
          id: organization.id,
          members: [otherUser.id],
          role: faker.helpers.arrayElement([
            ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
            ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
            ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
          ]),
        });
        const body = createBody({ intent, role, userId: otherUser.id });

        const response = await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(body),
          organizationSlug: organization.slug,
        });

        expect(response.status).toEqual(200);
        expect(await response.json()).toEqual({ message: 'Ok' });

        // It updates the members role.
        const updatedMembership =
          await retrieveOrganizationMembershipFromDatabaseByUserIdAndOrganizationId(
            {
              organizationId: organization.id,
              userId: otherUser.id,
            },
          );
        expect(updatedMembership?.role).toEqual(role);

        await deleteUserProfileFromDatabaseById(otherUser.id);
        await teardownOrganizationAndMember({ user, organization });
      },
    );

    test('given valid data with a role of deactivated: deactivates the membership and sets the deactivated at date', async () => {
      const { user, organization } = await setup();
      const otherUser = createPopulatedUserProfile();
      await saveUserProfileToDatabase(otherUser);
      const existingRole = faker.helpers.arrayElement([
        ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
        ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
        ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
      ]);
      await addMembersToOrganizationInDatabaseById({
        id: organization.id,
        members: [otherUser.id],
        role: existingRole,
      });
      const body = createBody({
        intent,
        role: 'deactivated',
        userId: otherUser.id,
      });
      const snapshot = new Date();

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
        organizationSlug: organization.slug,
      });

      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({ message: 'Ok' });

      // It updates the members role.
      const updatedMembership =
        await retrieveOrganizationMembershipFromDatabaseByUserIdAndOrganizationId(
          {
            organizationId: organization.id,
            userId: otherUser.id,
          },
        );
      expect(updatedMembership?.role).toEqual(existingRole);
      expect(updatedMembership?.deactivatedAt?.getTime()).toBeGreaterThan(
        snapshot.getTime(),
      );

      await deleteUserProfileFromDatabaseById(otherUser.id);
      await teardownOrganizationAndMember({ user, organization });
    });

    test('given the user tries to change its own role: return a 403 forbidden', async () => {
      const { user, organization } = await setup();
      const body = createBody({
        intent,
        role: faker.helpers.arrayElement([
          ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
          ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
          ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
          'deactivated',
        ]),
        userId: user.id,
      });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
        organizationSlug: organization.slug,
      });

      expect(response.status).toEqual(403);
      expect(await response.json()).toEqual({
        message: 'Forbidden',
        errors: { form: 'you-cannot-change-your-own-role' },
      });

      await teardownOrganizationAndMember({ user, organization });
    });

    test.each([
      ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
    ])('test given the user is a %s: returns a 403 forbidden', async role => {
      const { user, organization } = await setup(role);
      const otherUser = createPopulatedUserProfile();
      await saveUserProfileToDatabase(otherUser);
      await addMembersToOrganizationInDatabaseById({
        id: organization.id,
        members: [otherUser.id],
        role: faker.helpers.arrayElement([
          ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
          ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
          ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
        ]),
      });
      const body = createBody({
        intent,
        role: faker.helpers.arrayElement([
          ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
          ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
          ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
        ]),
        userId: otherUser.id,
      });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
        organizationSlug: organization.slug,
      });

      expect(response.status).toEqual(403);
      expect(await response.json()).toEqual({
        message: 'Forbidden',
        errors: { form: 'you-must-be-an-owner' },
      });

      await deleteUserProfileFromDatabaseById(otherUser.id);
      await teardownOrganizationAndMember({ user, organization });
    });

    test('given invalid form data: throws a 400 error', async () => {
      const { user, organization } = await setup();
      const body = createBody({ intent });

      try {
        await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(body),
          organizationSlug: organization.slug,
        });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(400);
          expect(await error.json()).toEqual({
            errors: {
              role: { message: 'Required', type: 'manual' },
              userId: { message: 'Required', type: 'manual' },
            },
            message: 'Bad Request',
          });
        }
      }

      await teardownOrganizationAndMember({ user, organization });
    });
  });
});
