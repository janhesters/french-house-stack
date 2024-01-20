import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import type { Organization, UserProfile } from '@prisma/client';
import { redirect } from '@remix-run/node';
import type { TFunction } from 'i18next';
import { z } from 'zod';

import { asyncPipe } from '~/utils/async-pipe';
import { forbidden } from '~/utils/http-responses.server';
import { withValidatedFormData } from '~/utils/parse-form-data.server';
import { redirectWithToast } from '~/utils/toast.server';

import { withTFunction } from '../localization/localization-middleware.server';
import type { OnboardingUser } from '../onboarding/onboarding-helpers.server';
import { withOnbaordedUser } from '../onboarding/onboarding-middleware.server';
import { retrieveUserProfileWithMembershipsFromDatabaseById } from '../user-profile/user-profile-model.server';
import {
  newOrganizationSchema,
  organizationProfileSchema,
} from './organizations-client-schemas';
import type { OrganizationMembershipRole } from './organizations-constants';
import { ORGANIZATION_MEMBERSHIP_ROLES } from './organizations-constants';
import { withOrganizationMembership } from './organizations-middleware.server';
import {
  addMembersToOrganizationInDatabaseById,
  deleteOrganizationFromDatabaseById,
  saveOrganizationToDatabase,
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
  role,
  t,
  user,
}: {
  data: z.infer<typeof organizationProfileServerSchema>;
  organization: Organization;
  role: OrganizationMembershipRole;
  t: TFunction;
  user: OnboardingUser;
}) {
  switch (data.intent) {
    case 'update': {
      if (
        !(
          role === ORGANIZATION_MEMBERSHIP_ROLES.ADMIN ||
          role === ORGANIZATION_MEMBERSHIP_ROLES.OWNER
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
      if (!(role === ORGANIZATION_MEMBERSHIP_ROLES.OWNER)) {
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
