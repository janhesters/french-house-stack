import type { LoaderFunctionArgs, TypedResponse } from '@remix-run/node';
import { json } from '@remix-run/node';

import { asyncPipe } from '~/utils/async-pipe';
import { withCurrentPage } from '~/utils/pagination.server';

import {
  withLocalization,
  withPageTitle,
  withTFunction,
} from '../localization/localization-middleware.server';
import { withOnbaordedUser } from '../onboarding/onboarding-middleware.server';
import type { OrganizationMembershipRole } from './organizations-constants';
import {
  mapOrganizationAndUserDataToSidebarProps,
  mapTeamMemberDataToTeamMembersPageProps,
  mapUserDataToNewOrganizationProps,
} from './organizations-helpers.server';
import {
  withCreatorAndOrganization,
  withHeaderProps,
  withInviteLinkToken,
  withMembersAndLatestInviteLink,
  withOrganizationMembership,
  withTotalMemberCount,
} from './organizations-middleware.server';
import type { TeamMembersInviteLinkCardComponentProps } from './team-members-invite-link-card-component';
import type { TeamMembersListCardComponentProps } from './team-members-list-card-component';

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

type organizationSettingsTeamMembersLoader = (
  loaderArguments: Pick<LoaderFunctionArgs, 'request' | 'params'>,
) => Promise<
  TypedResponse<
    {
      currentUsersRole: OrganizationMembershipRole;
      pageTitle: string;
    } & TeamMembersInviteLinkCardComponentProps &
      TeamMembersListCardComponentProps
  >
>;
export const organizationSettingsTeamMembersLoader: organizationSettingsTeamMembersLoader =
  asyncPipe(
    withOrganizationMembership,
    withLocalization({ tKey: 'organization-team-members:team-members' }),
    withTotalMemberCount,
    withCurrentPage,
    withMembersAndLatestInviteLink,
    mapTeamMemberDataToTeamMembersPageProps,
    json,
  );

export const acceptInviteLinkPageLoader = asyncPipe(
  withTFunction,
  withInviteLinkToken,
  withPageTitle({ tKey: 'accept-membership-invite:page-title' }),
  withCreatorAndOrganization,
  json,
);
