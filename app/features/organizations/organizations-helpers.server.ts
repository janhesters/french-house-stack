import type { LoaderFunctionArgs } from '@remix-run/node';

import type { HeaderUserProfileDropDownProps } from '~/components/header';
import { asyncPipe } from '~/utils/async-pipe';
import { notFound } from '~/utils/http-responses.server';
import { throwIfEntityIsMissing } from '~/utils/throw-if-entity-is-missing.server';

import type { OnboardingUser } from '../onboarding/onboarding-helpers.server';
import { getNameAbbreviation } from '../user-profile/user-profile-helpers.server';
import type { OrganizationMembershipRole } from './organizations-constants';
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

  return membership.role as OrganizationMembershipRole;
};
