import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import type { UserProfile } from '@prisma/client';
import { redirect } from '@remix-run/react';
import type { z } from 'zod';

import { asyncPipe } from '~/utils/async-pipe';
import { withValidatedFormData } from '~/utils/parse-form-data.server';

import { withOnbaordedUser } from '../onboarding/onboarding-middleware.server';
import { newOrganizationSchema } from './organizations-client-schemas';
import { ORGANIZATION_MEMBERSHIP_ROLES } from './organizations-constants';
import {
  addMembersToOrganizationInDatabaseById,
  saveOrganizationToDatabase,
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
