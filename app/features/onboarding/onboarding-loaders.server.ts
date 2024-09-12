import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { promiseHash } from 'remix-utils/promise';

import { getPageTitle } from '../localization/get-page-title.server';
import { i18next } from '../localization/i18next.server';
import { requireUserNeedsOnboarding } from './onboarding-helpers.server';

const onboardingLoader =
  (tkey: string) =>
  async ({ request }: Pick<LoaderFunctionArgs, 'request'>) => {
    const { t, ...rest } = await promiseHash({
      user: requireUserNeedsOnboarding(request),
      t: i18next.getFixedT(request),
      locale: i18next.getLocale(request),
    });

    return json({
      ...rest,
      t,
      pageTitle: getPageTitle(t, tkey, ''),
    });
  };

export const onboardingUserProfileLoader = onboardingLoader(
  'onboarding-user-profile:onboarding-user-profile',
);
export const onboardingOrganizationLoader = onboardingLoader(
  'onboarding-organization:onboarding-organization',
);
