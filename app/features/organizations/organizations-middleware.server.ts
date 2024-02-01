import type { Organization } from '@prisma/client';
import type { TFunction } from 'i18next';
import { promiseHash } from 'remix-utils/promise';

import { asyncPipe } from '~/utils/async-pipe';

import type { OnboardingUser } from '../onboarding/onboarding-helpers.server';
import { withOnbaordedUser } from '../onboarding/onboarding-middleware.server';
import type { Params } from './organizations-helpers.server';
import {
  getInviteLinkToken,
  getOrganizationSlug,
  getUsersRoleForOrganizationBySlug,
  requireCreatorAndOrganizationByTokenExists,
  requireOrganizationBySlugExists,
} from './organizations-helpers.server';
import {
  retrieveLatestInviteLinkFromDatabaseByOrganizationId,
  retrieveOrganizationMembersFromDatabaseByOrganizationIdForPage,
  retrieveTotalOrganizationMembersCountFromDatabaseByOrganizationId,
} from './organizations-model.server';

/**
 * Enriches an existing middleware object with an organization slug.
 *
 * @param middleware - A middleware object that contains parameters.
 * @returns A new middleware object with the same properties as the input
 * object, plus an organization slug, which defaults to an empty string.
 */
export const withOrganizationSlug = <T extends { params: Params }>({
  params,
  ...rest
}: T) => ({
  ...rest,
  params,
  organizationSlug: getOrganizationSlug(params),
});

/**
 * Enriches an existing middleware object with an organization retrieved by
 * its slug.
 *
 * @param object - A middleware object that contains the organization slug.
 * @returns A new middleware object with the same properties as the input
 * object, plus an organization retrieved from the database using the slug.
 * @throws A '404 not found' HTTP response if the organization doesn't exist.
 */
const withOrganizationBySlug = async <T extends { organizationSlug: string }>({
  organizationSlug,
  ...rest
}: T) => ({
  ...rest,
  organizationSlug,
  organization: await requireOrganizationBySlugExists(organizationSlug),
});

/**
 * Ensures that the user is a member of the provided organization.
 *
 * @param object - A middleware object that contains the user and the
 * organization.
 * @returns The same object if the user is a member of the organization.
 * @throws A '404 not found' HTTP response if the user is not a member of the
 * organization.
 */
export const withUserIsMemberOfOrganization = <
  T extends {
    user: OnboardingUser;
    organization: Organization;
  },
>({
  user,
  organization,
  ...rest
}: T) => ({
  user,
  organization,
  currentUsersRole: getUsersRoleForOrganizationBySlug(user, organization.slug),
  ...rest,
});

/**
 * A middleware for ensuring the request contains an authenticated and onboarded
 * user who is an active member of the organization with the slug in the
 * request.
 *
 * @param middleware - An object that contains the `LoaderArgs`
 * parameters from Remix.
 * @returns A new middleware object with the user's id, the user profile and
 * the organization of the given slug, if the user is a member of that
 * organization.
 * @throws A redirect and logs the user out, if the user is not authenticated.
 * @throws A redirect to the onboarding page, if the user is not onboarded.
 * @htrows A '404 not found' HTTP response if the organization doesn't exist or
 * the user is NOT an active member of the organization.
 */
export const withOrganizationMembership = asyncPipe(
  withOnbaordedUser,
  withOrganizationSlug,
  withOrganizationBySlug,
  withUserIsMemberOfOrganization,
);

/**
 * A middleware for adding the header title props for the organization sidebar.
 *
 * @param headerTitleKey - The key for the header title.
 * @param renderBackButton - Whether to render the back button.
 * @param middleware - An object that contains the `t` function from
 * React-i18next.
 * @returns A new middleware object with the header title props.
 */
export const withHeaderProps =
  ({
    headerTitleKey,
    renderBackButton = false,
  }: {
    headerTitleKey: string;
    renderBackButton?: boolean;
  }) =>
  <T extends { t: TFunction }>({ t, ...rest }: T) => ({
    t,
    ...rest,
    headerTitle: t(headerTitleKey),
    renderBackButton,
  });

/**
 * A middleware for retrieving the total number of members in an organization.
 *
 * @param middleware - An object that contains the organization for which to
 * count the members.
 * @returns A new middleware object with the total number of members in the
 * organization.
 */
export const withTotalMemberCount = async <
  T extends { organization: Organization },
>({
  organization,
  ...rest
}: T) => ({
  ...rest,
  organization,
  totalItemCount:
    await retrieveTotalOrganizationMembersCountFromDatabaseByOrganizationId(
      organization.id,
    ),
});

/**
 * A middleware for retrieving the latest invite link and the members for the
 * current page for an organization.
 *
 * @param middleware - An object that contains the organization and the current
 * page number.
 * @returns A new middleware object with the latest invite link and the members
 * for the current page for the organization.
 */
export const withMembersAndLatestInviteLink = async <
  T extends { organization: Organization; currentPage: number },
>({
  organization,
  currentPage,
  ...rest
}: T) => ({
  ...rest,
  organization,
  currentPage,
  ...(await promiseHash({
    latestOrganizationInviteLink:
      retrieveLatestInviteLinkFromDatabaseByOrganizationId(organization.id),
    members: retrieveOrganizationMembersFromDatabaseByOrganizationIdForPage({
      organizationId: organization.id,
      page: currentPage,
    }),
  })),
});

/**
 * Enriches an existing middleware object with an invite link token from the
 * query parmas.
 *
 * @param middleware - A middleware object that contains the request.
 * @returns A new middleware object with token from the request search
 * parameters.
 */
export const withInviteLinkToken = <T extends { request: Request }>({
  request,
  ...rest
}: T) => ({ ...rest, request, token: getInviteLinkToken(request) || '' });

/**
 * Enriches an existing middleware object with creator and organization data
 * retrieved by a token.
 *
 * @param object - A middleware object that contains the token.
 * @returns A new middleware object with the same properties as the input
 * object,  plus the creator and organization data associated with the token.
 * @throws A '404 not found' HTTP response if the invite link identified by the
 * token doesn't exist.
 */
export const withCreatorAndOrganization = async <T extends { token: string }>({
  token,
  ...rest
}: T) => ({
  token,
  ...rest,
  ...(await requireCreatorAndOrganizationByTokenExists(token)),
});
