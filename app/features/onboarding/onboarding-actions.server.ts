import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import type { UserProfile } from '@prisma/client';
import { redirect } from '@remix-run/node';
import type { z } from 'zod';

import { asyncPipe } from '~/utils/async-pipe';
import { withValidatedFormData } from '~/utils/parse-form-data.server';

import { ORGANIZATION_MEMBERSHIP_ROLES } from '../organizations/organizations-constants';
import {
  addMembersToOrganizationInDatabaseById,
  saveOrganizationToDatabase,
} from '../organizations/organizations-model.server';
import { updateUserProfileInDatabaseById } from '../user-profile/user-profile-model.server';
import {
  onboardingOrganizationSchema,
  onboardingUserProfileSchema,
} from './onboarding-client-schemas';
import { withUserRequiringOnboarding } from './onboarding-middleware.server';

async function onboardingUserProfileHandler({
  data,
  user,
}: {
  data: z.infer<typeof onboardingUserProfileSchema>;
  user: UserProfile;
}) {
  await updateUserProfileInDatabaseById({
    id: user.id,
    userProfile: { name: data.name },
  });
  return redirect('/onboarding/organization');
}

export const onboardingUserProfileAction = asyncPipe(
  withUserRequiringOnboarding,
  withValidatedFormData(onboardingUserProfileSchema),
  onboardingUserProfileHandler,
);

async function onboardingOrganizationHandler({
  data,
  user,
}: {
  data: z.infer<typeof onboardingOrganizationSchema>;
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

export const onboardingOrganizationAction = asyncPipe(
  withUserRequiringOnboarding,
  withValidatedFormData(onboardingOrganizationSchema),
  onboardingOrganizationHandler,
);
