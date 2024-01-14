import { json } from '@remix-run/node';

import { asyncPipe } from '~/utils/async-pipe';

import { withLocalization } from '../localization/localization-middleware.server';
import { withOnbaordedUser } from '../onboarding/onboarding-middleware.server';
import {
  mapOrganizationAndUserDataToNewOrganizationProps,
  mapOrganizationAndUserDataToSidebarProps,
} from './organizations-helpers.server';
import { withOrganizationMembership } from './organizations-middleware.server';

export const organizationSlugLoader = asyncPipe(
  withOrganizationMembership,
  mapOrganizationAndUserDataToSidebarProps,
  json,
);

export const newOrganizationLoader = asyncPipe(
  withOnbaordedUser,
  withLocalization({ tKey: 'organizations-new:create-new-organization' }),
  mapOrganizationAndUserDataToNewOrganizationProps,
  json,
);
