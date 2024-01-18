import { json } from '@remix-run/node';

import { asyncPipe } from '~/utils/async-pipe';

import { withLocalization } from '../localization/localization-middleware.server';
import { withOnbaordedUser } from '../onboarding/onboarding-middleware.server';
import { mapUserDataToSettingsProps } from './settings-helpers.server';
import { withUsersOwnedOrganizations } from './settings-middleware.server';

export const settingsLoader = asyncPipe(
  withOnbaordedUser,
  withLocalization({ tKey: 'settings:settings' }),
  mapUserDataToSettingsProps,
  json,
);

export const settingsUserProfileLoader = asyncPipe(
  withOnbaordedUser,
  withLocalization({ tKey: 'settings-user-profile:title' }),
  json,
);

export const settingsAccountLoader = asyncPipe(
  withOnbaordedUser,
  withUsersOwnedOrganizations,
  withLocalization({ tKey: 'settings-account:title' }),
  json,
);
