import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { promiseHash } from 'remix-utils/promise';

import { badRequest } from '~/utils/http-responses.server';
import { parseFormData } from '~/utils/parse-form-data.server';
import { createToastHeaders } from '~/utils/toast.server';

import { i18next } from '../localization/i18next.server';
import { requireOnboardedUserProfileExists } from '../onboarding/onboarding-helpers.server';
import { logout } from '../user-authentication/user-authentication-helpers.server';
import {
  deleteUserProfileFromDatabaseById,
  updateUserProfileInDatabaseById,
} from '../user-profile/user-profile-model.server';
import {
  settingsAccountSchema,
  settingsUserProfileSchema,
} from './settings-client-schemas';
import { getUsersOwnedOrganizations } from './settings-helpers.server';

export const settingsUserProfileAction = async ({
  request,
}: Pick<ActionFunctionArgs, 'request' | 'params'>) => {
  const user = await requireOnboardedUserProfileExists(request);
  const { data, t } = await promiseHash({
    data: parseFormData(settingsUserProfileSchema, request),
    t: i18next.getFixedT(request),
  });

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
};

export const settingsAccountAction = async ({
  request,
}: Pick<ActionFunctionArgs, 'request' | 'params'>) => {
  const user = await requireOnboardedUserProfileExists(request);
  await parseFormData(settingsAccountSchema, request);

  const usersOwnedOrganizations = getUsersOwnedOrganizations(user);

  if (usersOwnedOrganizations.length > 0) {
    return badRequest({ error: 'settings-account:still-an-owner' });
  }

  await deleteUserProfileFromDatabaseById(user.id);

  return await logout(request);
};
