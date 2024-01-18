import type { OnboardingUser } from '../onboarding/onboarding-helpers.server';
import { getUsersOwnedOrganizations } from './settings-helpers.server';

/**
 * Enriches an existing middleware object with the users owned organizations.
 *
 * @param param - A middleware object that contains the user.
 * @returns A new middleware object with the same properties as the input
 * object, plus an array of the user's owned organizations.
 */
export const withUsersOwnedOrganizations = <
  T extends {
    user: OnboardingUser;
  },
>({
  user,
  ...rest
}: T) => ({
  user,
  ...rest,
  usersOwnedOrganizations: getUsersOwnedOrganizations(user),
});
