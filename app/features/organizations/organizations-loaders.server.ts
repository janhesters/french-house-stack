import { json } from '@remix-run/node';

import { asyncPipe } from '~/utils/async-pipe';

import { mapOrganizationAndUserDataToSidebarProps } from './organizations-helpers.server';
import { withOrganizationMembership } from './organizations-middleware.server';

export const organizationSlugLoader = asyncPipe(
  withOrganizationMembership,
  mapOrganizationAndUserDataToSidebarProps,
  json,
);
