import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { parseFormData } from '~/utils/parse-form-data.server';

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
import { requireUserNeedsOnboarding } from './onboarding-helpers.server';

export const onboardingUserProfileAction = async ({
  request,
}: Pick<ActionFunctionArgs, 'request'>) => {
  const user = await requireUserNeedsOnboarding(request);
  const data = await parseFormData(onboardingUserProfileSchema, request);

  await updateUserProfileInDatabaseById({
    id: user.id,
    userProfile: { name: data.name },
  });
  return redirect('/onboarding/organization');
};

export const onboardingOrganizationAction = async ({
  request,
}: Pick<ActionFunctionArgs, 'request'>) => {
  const user = await requireUserNeedsOnboarding(request);
  const data = await parseFormData(onboardingOrganizationSchema, request);

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
};
