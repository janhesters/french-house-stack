import type { LoaderFunctionArgs } from '@remix-run/node';

import { asyncPipe } from '~/utils/async-pipe';
import { throwIfEntityIsMissing } from '~/utils/throw-if-entity-is-missing.server';

import type { OnboardingUser } from '../onboarding/onboarding-helpers.server';
import { getNameAbbreviation } from '../user-profile/user-profile-helpers.server';
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
 * Checks if a user is a member of an organization by checking if an
 * organization's id is in a user's list of organizations he is a member of.
 *
 * @param organizationId - The ID of the organization to check.
 * @param user - The user object to check within.
 * @returns True if the user is a member of the organization, false otherwise.
 */
export const getOrganizationIsInUserMembershipList = (
  organizationId: string,
  user: OnboardingUser,
) => user.memberships.some(({ organization: { id } }) => id === organizationId);

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
  organizationSlug,
  userNavigation: {
    abbreviation: getNameAbbreviation(user.name),
    email: user.email,
    name: user.name,
    items: [],
  },
});
