import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { promiseHash } from 'remix-utils/promise';

import { getPageTitle } from '../localization/get-page-title.server';
import { i18next } from '../localization/i18next.server';
import { requireOnboardedUserProfileExists } from '../onboarding/onboarding-helpers.server';
import {
  getUsersOwnedOrganizations,
  mapUserDataToSettingsProps,
} from './settings-helpers.server';

const retrieveOnboardedUserAndLocalization =
  (tKey: string) =>
  async ({ request }: Pick<LoaderFunctionArgs, 'request' | 'params'>) => {
    const user = await requireOnboardedUserProfileExists(request);

    const { t, locale } = await promiseHash({
      t: i18next.getFixedT(request),
      locale: i18next.getLocale(request),
    });

    return {
      t,
      locale,
      user,
      pageTitle: getPageTitle(t, tKey, ''),
    };
  };

export const settingsUserProfileLoader = retrieveOnboardedUserAndLocalization(
  'settings-user-profile:title',
);

export const settingsLoader = async ({
  request,
  params,
}: Pick<LoaderFunctionArgs, 'request' | 'params'>) => {
  const { user, ...rest } = await retrieveOnboardedUserAndLocalization(
    'settings:settings',
  )({ request, params });

  return json({
    ...rest,
    ...mapUserDataToSettingsProps({ user }),
  });
};

export const settingsAccountLoader = async ({
  request,
  params,
}: Pick<LoaderFunctionArgs, 'request' | 'params'>) => {
  const { user, ...rest } = await retrieveOnboardedUserAndLocalization(
    'settings-account:title',
  )({ request, params });

  return json({
    ...rest,
    user,
    usersOwnedOrganizations: getUsersOwnedOrganizations(user),
  });
};
