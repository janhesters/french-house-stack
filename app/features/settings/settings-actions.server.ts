import type { Organization, UserProfile } from '@prisma/client';
import { json } from '@remix-run/node';
import type { TFunction } from 'i18next';
import type { z } from 'zod';

import { asyncPipe } from '~/utils/async-pipe';
import { badRequest } from '~/utils/http-responses.server';
import { withValidatedFormData } from '~/utils/parse-form-data.server';
import { createToastHeaders } from '~/utils/toast.server';

import { withTFunction } from '../localization/localization-middleware.server';
import { withOnbaordedUser } from '../onboarding/onboarding-middleware.server';
import { logout } from '../user-authentication/user-authentication-helpers.server';
import {
  deleteUserProfileFromDatabaseById,
  updateUserProfileInDatabaseById,
} from '../user-profile/user-profile-model.server';
import {
  settingsAccountSchema,
  settingsUserProfileSchema,
} from './settings-client-schemas';
import { withUsersOwnedOrganizations } from './settings-middleware.server';

async function settingsUserProfileHandler({
  data,
  t,
  user,
}: {
  data: z.infer<typeof settingsUserProfileSchema>;
  t: TFunction;
  user: UserProfile;
}) {
  if (user.name !== data.name) {
    await updateUserProfileInDatabaseById({
      id: user.id,
      userProfile: { name: data.name },
    });
  }
  const headers = await createToastHeaders({
    title: t('settings-user-profile:user-profile-updated'),
  });
  return json({ success: true }, { headers });
}

export const settingsUserProfileAction = asyncPipe(
  withOnbaordedUser,
  withValidatedFormData(settingsUserProfileSchema),
  withTFunction,
  settingsUserProfileHandler,
);

async function settingsAccountHandler({
  request,
  user,
  usersOwnedOrganizations,
}: {
  request: Request;
  user: UserProfile;
  usersOwnedOrganizations: Pick<Organization, 'name' | 'id' | 'slug'>[];
}) {
  if (usersOwnedOrganizations.length > 0) {
    return badRequest({ error: 'settings-account:still-an-owner' });
  }

  await deleteUserProfileFromDatabaseById(user.id);

  return await logout(request);
}

export const settingsAccountAction = asyncPipe(
  withOnbaordedUser,
  withUsersOwnedOrganizations,
  withValidatedFormData(settingsAccountSchema),
  settingsAccountHandler,
);
