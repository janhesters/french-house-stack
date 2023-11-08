import { json } from '@remix-run/node';

import { asyncPipe } from '~/utils/async-pipe';

import { withLocalization } from '../localization/localization-middleware.server';
import { withUserRequiringOnboarding } from './onboarding-middleware.server';

export const onboardingUserProfileLoader = asyncPipe(
  withUserRequiringOnboarding,
  withLocalization({ tKey: 'onboarding-user-profile:onboarding-user-profile' }),
  json,
);

export const onboardingOrganizationLoader = asyncPipe(
  withUserRequiringOnboarding,
  withLocalization({ tKey: 'onboarding-organization:onboarding-organization' }),
  json,
);
