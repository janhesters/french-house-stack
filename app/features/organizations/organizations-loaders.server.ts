import { json } from '@remix-run/node';

import { asyncPipe } from '~/utils/async-pipe';

import {
  withLocalization,
  withPageTitle,
  withTFunction,
} from '../localization/localization-middleware.server';
import { withOnbaordedUser } from '../onboarding/onboarding-middleware.server';
import {
  mapOrganizationAndUserDataToSidebarProps,
  mapUserDataToNewOrganizationProps,
} from './organizations-helpers.server';
import {
  withHeaderProps,
  withOrganizationMembership,
} from './organizations-middleware.server';

export const organizationSlugLoader = asyncPipe(
  withOrganizationMembership,
  mapOrganizationAndUserDataToSidebarProps,
  json,
);

export const newOrganizationLoader = asyncPipe(
  withOnbaordedUser,
  withLocalization({ tKey: 'organizations-new:create-new-organization' }),
  mapUserDataToNewOrganizationProps,
  json,
);

export const organizationSettingsLoader = asyncPipe(
  withOrganizationMembership,
  withTFunction,
  withPageTitle({ tKey: 'organization-settings:organization-settings' }),
  withHeaderProps({
    headerTitleKey: 'organization-settings:organization-settings',
  }),
  json,
);

export const organizationSettingsProfileLoader = asyncPipe(
  withOrganizationMembership,
  withTFunction,
  withPageTitle({ tKey: 'organization-profile:general' }),
  json,
);
