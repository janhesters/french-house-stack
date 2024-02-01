import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import type { Organization, UserProfile } from '@prisma/client';
import { json, redirect } from '@remix-run/node';
import type { TFunction } from 'i18next';
import { z } from 'zod';

import { asyncPipe } from '~/utils/async-pipe';
import { getErrorMessage } from '~/utils/get-error-message';
import { badRequest, created, forbidden } from '~/utils/http-responses.server';
import { withValidatedFormData } from '~/utils/parse-form-data.server';
import { createToastHeaders, redirectWithToast } from '~/utils/toast.server';

import { withTFunction } from '../localization/localization-middleware.server';
import type { OnboardingUser } from '../onboarding/onboarding-helpers.server';
import { withOnbaordedUser } from '../onboarding/onboarding-middleware.server';
import { getUserAuthSession } from '../user-authentication/user-authentication-helpers.server';
import { retrieveUserProfileWithMembershipsFromDatabaseById } from '../user-profile/user-profile-model.server';
import { saveInviteLinkUseToDatabase } from './invite-link-uses-model.server';
import {
  newOrganizationSchema,
  organizationProfileSchema,
} from './organizations-client-schemas';
import type { OrganizationMembershipRole } from './organizations-constants';
import { ORGANIZATION_MEMBERSHIP_ROLES } from './organizations-constants';
import { getInviteLinkToken } from './organizations-helpers.server';
import {
  saveOrganizationInviteLinkToDatabase,
  updateOrganizationInviteLinkInDatabaseById,
} from './organizations-invite-link-model.server';
import { withOrganizationMembership } from './organizations-middleware.server';
import {
  addMembersToOrganizationInDatabaseById,
  deleteOrganizationFromDatabaseById,
  retrieveActiveInviteLinkFromDatabaseByToken,
  retrieveLatestInviteLinkFromDatabaseByOrganizationId,
  saveOrganizationToDatabase,
  updatedMembershipInDatabaseByUserIdAndOrganizationId,
  updateOrganizationInDatabaseById,
} from './organizations-model.server';

async function newOrganizationHandler({
  data,
  user,
}: {
  data: z.infer<typeof newOrganizationSchema>;
  user: UserProfile;
}) {
  const organization = await saveOrganizationToDatabase({
    id: createId(),
    name: data.name,
    slug: faker.helpers.slugify(data.name).toLowerCase(),
  });
  await addMembersToOrganizationInDatabaseById({
    id: organization.id,
    members: [user.id],
    role: ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
  });
  return redirect(`/organizations/${organization.slug}`);
}

export const newOrganizationAction = asyncPipe(
  withOnbaordedUser,
  withValidatedFormData(newOrganizationSchema),
  newOrganizationHandler,
);

const organizationProfileServerSchema = z.discriminatedUnion('intent', [
  organizationProfileSchema,
  z.object({
    intent: z.literal('delete'),
  }),
]);

async function organizationProfileHandler({
  data,
  organization,
  currentUsersRole,
  t,
  user,
}: {
  data: z.infer<typeof organizationProfileServerSchema>;
  organization: Organization;
  currentUsersRole: OrganizationMembershipRole;
  t: TFunction;
  user: OnboardingUser;
}) {
  switch (data.intent) {
    case 'update': {
      if (
        !(
          currentUsersRole === ORGANIZATION_MEMBERSHIP_ROLES.ADMIN ||
          currentUsersRole === ORGANIZATION_MEMBERSHIP_ROLES.OWNER
        )
      ) {
        throw forbidden();
      }

      const newSlug = faker.helpers.slugify(data.name).toLowerCase();
      if (organization.name !== data.name) {
        await updateOrganizationInDatabaseById({
          id: organization.id,
          organization: { name: data.name, slug: newSlug },
        });
      }

      return await redirectWithToast(
        `/organizations/${newSlug}/settings/profile`,
        {
          title: t('organization-profile:organization-profile-updated'),
        },
      );
    }
    case 'delete': {
      if (!(currentUsersRole === ORGANIZATION_MEMBERSHIP_ROLES.OWNER)) {
        throw forbidden();
      }

      await deleteOrganizationFromDatabaseById(organization.id);
      const updatedUser =
        await retrieveUserProfileWithMembershipsFromDatabaseById(user.id);

      const [firstMembership] = updatedUser?.memberships ?? [];
      const redirectUrl = firstMembership
        ? `/organizations/${firstMembership.organization.slug}/home`
        : '/onboarding/organization';

      return await redirectWithToast(redirectUrl, {
        title: t('organization-profile:organization-deleted'),
      });
    }
  }
}

export const organizationProfileAction = asyncPipe(
  withOrganizationMembership,
  withValidatedFormData(organizationProfileServerSchema),
  withTFunction,
  organizationProfileHandler,
);

export const teamMembersSchema = z.discriminatedUnion('intent', [
  z.object({ intent: z.literal('createNewInviteLink') }),
  z.object({ intent: z.literal('deactivateInviteLink') }),
  z.object({
    intent: z.literal('changeRole'),
    userId: z.string().cuid2(),
    role: z.enum([
      ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
      ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
      'deactivated',
    ]),
  }),
]);

const TWO_DAYS_IN_MILLISECONDS = 2 * 24 * 60 * 60 * 1000;

async function organzitionTeamMembersHandler({
  currentUsersRole,
  data,
  organization,
  user,
}: {
  currentUsersRole: OrganizationMembershipRole;
  data: z.infer<typeof teamMembersSchema>;
  organization: Organization;
  user: OnboardingUser;
}) {
  if (currentUsersRole !== ORGANIZATION_MEMBERSHIP_ROLES.OWNER) {
    return forbidden({ errors: { form: 'you-must-be-an-owner' } });
  }

  switch (data.intent) {
    case 'createNewInviteLink': {
      const latestInviteLink =
        await retrieveLatestInviteLinkFromDatabaseByOrganizationId(
          organization.id,
        );

      if (latestInviteLink && !latestInviteLink.deactivatedAt) {
        await updateOrganizationInviteLinkInDatabaseById({
          id: latestInviteLink.id,
          organizationInviteLink: { deactivatedAt: new Date() },
        });
      }

      const token = createId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + TWO_DAYS_IN_MILLISECONDS);
      await saveOrganizationInviteLinkToDatabase({
        token,
        expiresAt,
        creatorId: user.id,
        organizationId: organization.id,
      });

      return created();
    }

    case 'deactivateInviteLink': {
      const latestInviteLink =
        await retrieveLatestInviteLinkFromDatabaseByOrganizationId(
          organization.id,
        );

      if (latestInviteLink && !latestInviteLink.deactivatedAt) {
        await updateOrganizationInviteLinkInDatabaseById({
          id: latestInviteLink.id,
          organizationInviteLink: { deactivatedAt: new Date() },
        });
      }

      return json({ message: 'Ok' });
    }

    case 'changeRole': {
      const { userId, role } = data;

      if (userId === user.id) {
        return forbidden({
          errors: { form: 'you-cannot-change-your-own-role' },
        });
      }

      const updatedData =
        role === 'deactivated'
          ? { deactivatedAt: new Date() }
          : // eslint-disable-next-line unicorn/no-null
            { deactivatedAt: null, role };

      await updatedMembershipInDatabaseByUserIdAndOrganizationId({
        userId,
        organizationId: organization.id,
        membership: updatedData,
      });

      return json({ message: 'Ok' });
    }
  }
}

export const organizationTeamMembersAction = asyncPipe(
  withOrganizationMembership,
  withValidatedFormData(teamMembersSchema),
  organzitionTeamMembersHandler,
);

const organizationsAcceptInviteSchema = z.object({
  intent: z.literal('acceptInvite'),
});

async function acceptInviteLinkHandler({
  data,
  request,
  t,
}: {
  data: z.infer<typeof organizationsAcceptInviteSchema>;
  request: Request;
  t: TFunction;
}) {
  const { intent } = data;

  switch (intent) {
    case 'acceptInvite': {
      const { userAuthSession } = await getUserAuthSession(request);
      const token = getInviteLinkToken(request) || '';
      const link = await retrieveActiveInviteLinkFromDatabaseByToken(token);

      if (!link) {
        const headers = await createToastHeaders({
          title: t('accept-membership-invite:invite-link-invalid-toast-title'),
          description: t(
            'accept-membership-invite:invite-link-invalid-toast-description',
          ),
          type: 'error',
        });

        return badRequest({ error: 'Invalid token' }, { headers });
      }

      if (userAuthSession) {
        try {
          await addMembersToOrganizationInDatabaseById({
            id: link.organization.id,
            members: [userAuthSession.user.id],
            role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
          });
          await saveInviteLinkUseToDatabase({
            id: createId(),
            inviteLinkId: link.id,
            userId: userAuthSession.user.id,
          });
          return redirectWithToast(
            `/organizations/${link.organization.slug}/home`,
            {
              title: t('accept-membership-invite:join-success-toast-title'),
              description: t(
                'accept-membership-invite:join-success-toast-description',
                { organizationName: link.organization.name },
              ),
              type: 'success',
            },
          );
        } catch (error) {
          const message = getErrorMessage(error);

          if (
            message.includes(
              'Unique constraint failed on the fields: (`memberId`,`organizationId`)',
            )
          ) {
            return await redirectWithToast(
              `/organizations/${link.organization.slug}/home`,
              {
                title: t('accept-membership-invite:already-member-toast-title'),
                description: t(
                  'accept-membership-invite:already-member-toast-description',
                  { organizationName: link.organization.name },
                ),
                type: 'info',
              },
            );
          }

          throw error;
        }
      }

      return await redirectWithToast(`/register?token=${token}`, {
        title: t('accept-membership-invite:invite-link-valid-toast-title'),
        description: t(
          'accept-membership-invite:invite-link-valid-toast-description',
        ),
        type: 'info',
      });
    }
  }
}

export const organizationsAcceptInviteAction = asyncPipe(
  withTFunction,
  withValidatedFormData(organizationsAcceptInviteSchema),
  acceptInviteLinkHandler,
);
