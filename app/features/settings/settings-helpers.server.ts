import type { HeaderUserProfileDropDownProps } from '~/components/header';

import type { OnboardingUser } from '../onboarding/onboarding-helpers.server';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '../organizations/organizations-constants';
import { getNameAbbreviation } from '../user-profile/user-profile-helpers.server';

/**
 * Transforms user data into the props for the settings page.
 *
 * @param {Data} param - An object containing at least a `user` field of
 * the `OnboardingUser` type.
 * @param {OnboardingUser} param.user - The user data to be transformed.
 * @param rest - Additional properties that will be included in the returned
 * object as-is.
 * @returns An object with `userNavigation` for the header user profile
 * dropdown, including the original `user` object and any other properties.
 */
export const mapUserDataToSettingsProps = <
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
    items: [] as HeaderUserProfileDropDownProps['items'],
  },
  user,
  ...rest,
});

/**
 * Filters out the organizations that the user is an owner of.
 *
 * @param {OnboardingUser} user - The user to check for ownership status.
 * @returns An array of organizations that the user is an owner of.
 */
export const getUsersOwnedOrganizations = (user: OnboardingUser) =>
  user.memberships
    .filter(({ role }) => role === ORGANIZATION_MEMBERSHIP_ROLES.OWNER)
    .map(({ organization }) => organization);
