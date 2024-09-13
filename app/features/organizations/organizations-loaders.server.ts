import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { promiseHash } from 'remix-utils/promise';

import type { HeaderUserProfileDropDownProps } from '~/components/header';
import { getValidPageFromRequest } from '~/utils/pagination.server';

import { getPageTitle } from '../localization/get-page-title.server';
import { i18next } from '../localization/i18next.server';
import { requireOnboardedUserProfileExists } from '../onboarding/onboarding-helpers.server';
import { getNameAbbreviation } from '../user-profile/user-profile-helpers.server';
import { ORGANIZATION_MEMBERSHIP_ROLES } from './organizations-constants';
import {
  formatExpirationDate,
  getInviteLinkToken,
  getOrganizationSlug,
  getUsersRoleForOrganizationBySlug,
  mapOrganizationAndUserDataToSidebarProps,
  requireCreatorAndOrganizationByTokenExists,
  requireOrganizationBySlugExists,
  tokenToInviteLink,
} from './organizations-helpers.server';
import {
  retrieveLatestInviteLinkFromDatabaseByOrganizationId,
  retrieveOrganizationMembersFromDatabaseByOrganizationIdForPage,
  retrieveTotalOrganizationMembersCountFromDatabaseByOrganizationId,
} from './organizations-model.server';

const retrieveOrganizationMembership = async ({
  request,
  params,
}: Pick<LoaderFunctionArgs, 'request' | 'params'>) => {
  const organizationSlug = getOrganizationSlug(params);
  const user = await requireOnboardedUserProfileExists(request);
  const organization = await requireOrganizationBySlugExists(organizationSlug);

  return {
    organization,
    user,
    organizationSlug,
    currentUsersRole: getUsersRoleForOrganizationBySlug(
      user,
      organization.slug,
    ),
  };
};

export const organizationSlugLoader = async ({
  request,
  params,
}: Pick<LoaderFunctionArgs, 'request' | 'params'>) => {
  const { user, organizationSlug, ...rest } =
    await retrieveOrganizationMembership({ request, params });

  return json({
    ...rest,
    ...mapOrganizationAndUserDataToSidebarProps({ organizationSlug, user }),
    params,
    user,
  });
};

export const newOrganizationLoader = async ({
  request,
  params,
}: Pick<LoaderFunctionArgs, 'request' | 'params'>) => {
  const { t, user, ...rest } = await promiseHash({
    user: requireOnboardedUserProfileExists(request),
    t: i18next.getFixedT(request),
    locale: i18next.getLocale(request),
  });

  return json({
    ...rest,
    params,
    user,
    t,
    pageTitle: getPageTitle(t, 'organizations-new:create-new-organization', ''),
    userNavigation: {
      abbreviation: getNameAbbreviation(user.name),
      email: user.email,
      name: user.name,
      items: [
        { name: 'header:settings', href: '/settings' },
      ] as HeaderUserProfileDropDownProps['items'],
    },
  });
};

export const organizationSettingsLoader = async ({
  request,
  params,
}: Pick<LoaderFunctionArgs, 'request' | 'params'>) => {
  const { t, organizationMembership } = await promiseHash({
    t: i18next.getFixedT(request),
    organizationMembership: retrieveOrganizationMembership({ request, params }),
  });

  return json({
    ...organizationMembership,
    t,
    pageTitle: getPageTitle(
      t,
      'organization-settings:organization-settings',
      '',
    ),
    headerTitle: t('organization-settings:organization-settings'),
    renderBackButton: false,
  });
};

export const organizationSettingsProfileLoader = async ({
  request,
  params,
}: Pick<LoaderFunctionArgs, 'request' | 'params'>) => {
  const { t, organizationMembership } = await promiseHash({
    t: i18next.getFixedT(request),
    organizationMembership: retrieveOrganizationMembership({ request, params }),
  });

  return json({
    ...organizationMembership,
    t,
    pageTitle: getPageTitle(t, 'organization-profile:general', ''),
  });
};

export const organizationSettingsTeamMembersLoader = async ({
  request,
  params,
}: Pick<LoaderFunctionArgs, 'request' | 'params'>) => {
  const { organization, currentUsersRole, user, ...rest } =
    await retrieveOrganizationMembership({ request, params });

  const totalItemCount =
    await retrieveTotalOrganizationMembersCountFromDatabaseByOrganizationId(
      organization.id,
    );

  const currentPage = getValidPageFromRequest({ request, totalItemCount });

  const { t, locale, latestOrganizationInviteLink, members } =
    await promiseHash({
      t: i18next.getFixedT(request),
      locale: i18next.getLocale(request),
      latestOrganizationInviteLink:
        retrieveLatestInviteLinkFromDatabaseByOrganizationId(organization.id),
      members: retrieveOrganizationMembersFromDatabaseByOrganizationIdForPage({
        organizationId: organization.id,
        page: currentPage,
      }),
    });

  return json({
    ...rest,
    organization,
    t,
    locale,
    currentPage,
    latestOrganizationInviteLink,
    members,
    currentUsersRole,
    user,
    totalItemCount,
    pageTitle: getPageTitle(t, 'organization-team-members:team-members', ''),
    currentUserIsOwner:
      currentUsersRole === ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
    currentUsersId: user.id,
    inviteLink: latestOrganizationInviteLink
      ? {
          href: tokenToInviteLink(latestOrganizationInviteLink.token, request),
          expiryDate: formatExpirationDate(
            latestOrganizationInviteLink.expiresAt,
            locale,
          ),
        }
      : undefined,
    teamMembers: members.map(
      ({ member: { email, id, name }, role, deactivatedAt }) => ({
        deactivatedAt,
        email,
        id,
        name,
        role,
      }),
    ),
  });
};

export const acceptInviteLinkPageLoader = async ({
  request,
}: Pick<LoaderFunctionArgs, 'request'>) => {
  const token = getInviteLinkToken(request) || '';
  const { t, creatorAndOrganization } = await promiseHash({
    t: i18next.getFixedT(request),
    creatorAndOrganization: requireCreatorAndOrganizationByTokenExists(token),
  });

  return json({
    t,
    token,
    ...creatorAndOrganization,
    pageTitle: getPageTitle(t, 'accept-membership-invite:page-title', ''),
  });
};
