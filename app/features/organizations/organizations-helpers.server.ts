import type { LoaderFunctionArgs } from '@remix-run/node';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';

import type { HeaderUserProfileDropDownProps } from '~/components/header';
import { asyncPipe } from '~/utils/async-pipe';
import { getSearchParameterFromRequest } from '~/utils/get-search-parameter-from-request.server';
import { notFound } from '~/utils/http-responses.server';
import { throwIfEntityIsMissing } from '~/utils/throw-if-entity-is-missing.server';

import type { OnboardingUser } from '../onboarding/onboarding-helpers.server';
import { getNameAbbreviation } from '../user-profile/user-profile-helpers.server';
import type { OrganizationMembershipRole } from './organizations-constants';
import { ORGANIZATION_MEMBERSHIP_ROLES } from './organizations-constants';
import { retrieveCreatorAndOrganizationFromDatabaseByToken } from './organizations-invite-link-model.server';
import type {
  retrieveLatestInviteLinkFromDatabaseByOrganizationId,
  retrieveOrganizationMembersFromDatabaseByOrganizationIdForPage,
} from './organizations-model.server';
import { retrieveOrganizationFromDatabaseBySlug } from './organizations-model.server';
import type { OrganizationsSideBarComponentProps } from './organizations-sidebar-component';

export type Params = LoaderFunctionArgs['params'];

/**
 * Extracts the organization slug from the provided parameters.
 *
 * @param params - An object containing various parameters from Remix including
 * the organization slug.
 * @returns The organization slug if it exists, otherwise an empty string.
 */
export const getOrganizationSlug = (params: Params) =>
  params.organizationSlug ?? '';

/**
 * Ensures that the provided organization exists in the database.
 *
 * @param organizationSlug - The slug of the organization to retrieve.
 * @returns The organization retrieved from the database.
 * @throws A '404 not found' HTTP response if the organization doesn't exist.
 */
export const requireOrganizationBySlugExists = asyncPipe(
  retrieveOrganizationFromDatabaseBySlug,
  throwIfEntityIsMissing,
);

/**
 * Maps the organization slug and user data to the props needed for the
 * organizations sidebar component.
 *
 * @param data - An object containing the organization slug and user data.
 * @param data.organizationSlug - The slug of the organization to retrieve.
 * @param data.user - The user object to map to the sidebar props.
 * @returns The props needed for the organizations sidebar component.
 */
export const mapOrganizationAndUserDataToSidebarProps = <
  Data extends {
    organizationSlug: string;
    user: OnboardingUser;
  },
>({
  organizationSlug,
  user,
}: Data): OrganizationsSideBarComponentProps => ({
  organizations: user.memberships.map(({ organization: { name, slug } }) => ({
    isCurrent: slug === organizationSlug,
    name,
    slug,
  })),
  organizationSlug,
  userNavigation: {
    abbreviation: getNameAbbreviation(user.name),
    email: user.email,
    name: user.name,
    items: [{ name: 'header:settings', href: '/settings' }],
  },
});

/**
 *  Maps the user data to the props needed for the new organization page.
 *
 * @param data - An object containing the user data.
 * @param data.user - The user object to map to the sidebar props.
 * @returns The props needed for the new organization page.
 */
export const mapUserDataToNewOrganizationProps = <
  Data extends {
    user: OnboardingUser;
  },
>({
  user,
  ...rest
}: Data) => ({
  userNavigation: {
    abbreviation: getNameAbbreviation(user.name),
    email: user.email,
    name: user.name,
    items: [
      { name: 'header:settings', href: '/settings' },
    ] as HeaderUserProfileDropDownProps['items'],
  },
  user,
  ...rest,
});

/**
 * Checks if a string is a valid `OrganizationMembershipRole`.
 *
 * @param role - The string to check.
 * @returns `true` if the string is a valid `OrganizationMembershipRole`,
 * otherwise `false`.
 */
const getIsRoleValid = (role: string): role is OrganizationMembershipRole =>
  !!role && Object.values(ORGANIZATION_MEMBERSHIP_ROLES).includes(role as any);

/**
 * Parse a string to an `OrganizationMembershipRole`.
 *
 * @param role - The role string to be parsed.
 * @returns - The `OrganizationMembershipRole` corresponding to the input
 * string.
 * @throws - An error if the provided string does not correspond to a valid
 * `OrganizationMembershipRole`.
 */
export function parseOrganizationMembershipRole(role: string) {
  if (getIsRoleValid(role)) {
    return role;
  }

  throw new Error(
    `[parseOrganizationMembershipRole] Invalid organization membership role: ${role}.`,
  );
}

/**
 * Gets the role of a user within the given organization by slug.
 * Throws a 404 Not Found response if the user is NOT a member of the
 * organization.
 *
 * @param user - The user to check.
 * @param organizationSlug - The slug of the organization to check.
 * @returns The role of the user within the organization.
 * @throws A '404 not found' HTTP response if the user is NOT a member of the
 * organization.
 */
export const getUsersRoleForOrganizationBySlug = (
  user: OnboardingUser,
  organizationSlug: string,
) => {
  const membership = user.memberships.find(
    ({ organization: { slug } }) => slug === organizationSlug,
  );

  if (!membership) {
    throw notFound();
  }

  return parseOrganizationMembershipRole(membership.role);
};

/**
 * Converts a token to an invite link.
 *
 * @param token - The token to convert.
 * @param request - The request object.
 * @returns The invite link.
 */
export const tokenToInviteLink = (token: string, request: Request) => {
  const requestUrl = new URL(request.url);
  const url = new URL('/organizations/invite', requestUrl.origin);
  url.searchParams.set('token', token);
  return url.toString();
};

const locales = {
  en: enUS,
  de: de,
};

const parseLocale = (locale: string): locale is keyof typeof locales =>
  Object.keys(locales).includes(locale);

/**
 * Formats a given date into a string representation, based on a specified
 * locale.
 *
 * The formatted date string will follow these patterns:
 * - For 'en' locale: 'MMMM d yyyy, p' (e.g., 'June 4 2023, 10:18 PM')
 * - For 'de' locale: 'd. MMMM yyyy, p' (e.g., '4. Juni 2023, 22:18')
 *
 * @param date - The `Date` object to be formatted.
 * @param locale - The locale to use when formatting the date. This argument is
 * optional and defaults to 'en'.
 * If the locale isn't 'en' or 'de', 'en' will be used.
 *
 * @returns A string representing the formatted date.
 */
export function formatExpirationDate(date: Date, locale?: string) {
  const key = locale && parseLocale(locale) ? locale : 'en';
  const formatString = locale === 'de' ? 'd. MMMM yyyy, p' : 'MMMM d yyyy, p';
  return format(date, formatString, { locale: locales[key] });
}

type TeamMemberData = {
  currentUsersRole: OrganizationMembershipRole;
  latestOrganizationInviteLink: Awaited<
    ReturnType<typeof retrieveLatestInviteLinkFromDatabaseByOrganizationId>
  >;
  members: Awaited<
    ReturnType<
      typeof retrieveOrganizationMembersFromDatabaseByOrganizationIdForPage
    >
  >;
  locale: string;
  request: Request;
  user: OnboardingUser;
};

/**
 * This function maps the team member data to the properties required by the
 * organization settings team member page.
 *
 * @param latestOrganizationInviteLink - The latest organization invite link
 * data retrieved from the database by organization id.
 * @param members - The list of members data retrieved from the database for the
 * given organization and page.
 * @param request - The request object.
 *
 * @returns An object with the following properties:
 * - `teamMembers`: An array of team members with their name, email, role and
 * activity status.
 * - `inviteLink`: The latest organization invite link if exists, which contains
 * the href and the expiry date, otherwise `undefined`.
 */
export const mapTeamMemberDataToTeamMembersPageProps = <
  Data extends TeamMemberData,
>({
  currentUsersRole,
  latestOrganizationInviteLink,
  locale,
  members,
  request,
  user,
  ...rest
}: Data) => ({
  ...rest,
  currentUserIsOwner: currentUsersRole === ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
  currentUsersId: user.id,
  currentUsersRole,
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
  user,
});

/**
 * Extracts the token for an invite link from the search parameters.
 *
 * @param Request - The request to get the token from.
 * @returns The token from the request params, or null.
 */
export const getInviteLinkToken = getSearchParameterFromRequest('token');

/**
 * Checks if the provided invite link has expired.
 *
 * @param link - The invite link object retrieved from the database.
 * @throws A '403 Forbidden' HTTP response if the invite link has expired.
 */
export const throwIfInviteLinkIsExpired = (
  link: NonNullable<
    Awaited<
      ReturnType<typeof retrieveCreatorAndOrganizationFromDatabaseByToken>
    >
  >,
) => {
  if (new Date() > link.expiresAt) {
    throw notFound();
  }

  return link;
};

/**
 * Validates and returns the organization invite link identified by the provided
 * token.
 *
 * @param token - The unique token identifying the invite link.
 * @returns A Promise that resolves with the invite link object if it exists and
 * has not expired.
 * @throws A '404 Not Found' error if the invite link does not exist in the
 * database or is expired.
 */
export const requireInviteLinkByTokenExists = asyncPipe(
  retrieveCreatorAndOrganizationFromDatabaseByToken,
  throwIfEntityIsMissing,
  throwIfInviteLinkIsExpired,
);

/**
 * Ensures that an invite link identified by the provided token exists in the
 * database.
 *
 * @param token - The unique token for the invite link.
 * @returns An object containing creator and organization data associated with
 * the token.
 * @throws A '404 not found' HTTP response if the invite link identified by the
 * token doesn't exist.
 */
export const requireCreatorAndOrganizationByTokenExists = asyncPipe(
  requireInviteLinkByTokenExists,
  ({ creator, organization }) => ({
    inviterName: creator?.name || '',
    organizationName: organization.name,
  }),
);
