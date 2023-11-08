import { redirect } from '@remix-run/node';

import { asyncPipe } from '~/utils/async-pipe';

import { requireUserExists } from '../user-profile/user-profile-helpers.server';

/**
 * The user for the onboarding helper functions. Should only be scoped to this
 * file.
 */
export type OnboardingUser = Awaited<ReturnType<typeof requireUserExists>>;

/**
 * Checks if the user is onboarded, which means they have a name and are a
 * member of at least one organization.
 *
 * @param user - The OnboardingUser object.
 * @returns `true` if the user is onboarded; otherwise, `false`.
 */
export const getUserIsOnboarded = (user: OnboardingUser) =>
  user.memberships.length > 0 && user.name.length > 0;

/**
 * Checks if the user is onboarded; if so, redirects the user to their first
 * organization.
 *
 * @param user - The OnboardingUser object.
 * @returns The user object if not onboarded.
 * @throws Response with 302 status redirecting to the user's first organization
 * if the user is onboarded.
 */
export const throwIfUserIsOnboarded = (user: OnboardingUser) => {
  if (getUserIsOnboarded(user)) {
    const slug = user.memberships[0].organization.slug;
    throw redirect(`/organizations/${slug}`);
  }

  return user;
};

/**
 * Redirects the user to the appropriate onboarding step based on their state.
 *
 * @param request - The Request object containing the user's request.
 * @returns A function that takes the user object and returns it if the user is
 * on the correct onboarding step; otherwise, throws a 302 redirect to the
 * appropriate step.
 */
export const redirectUserToOnboardingStep =
  (request: Request) => (user: OnboardingUser) => {
    const { pathname } = new URL(request.url);

    if (user.name.length === 0 && pathname !== '/onboarding/user-profile') {
      throw redirect('/onboarding/user-profile');
    }

    if (
      user.name.length > 0 &&
      user.memberships.length === 0 &&
      pathname !== '/onboarding/organization'
    ) {
      throw redirect('/onboarding/organization');
    }

    return user;
  };

/**
 * Ensures the user needs onboarding and redirects to the appropriate onboarding
 * step. If the user is onboarded, it navigates to their first organization.
 *
 * @param request - The request object containing the user's request.
 * @returns The user object if the user needs onboarding and is on the correct
 * step.
 * @throws A response with the appropriate error status or redirect based on the
 * user's onboarding status.
 */
export const requireUserNeedsOnboarding = (request: Request) =>
  asyncPipe(
    requireUserExists,
    throwIfUserIsOnboarded,
    redirectUserToOnboardingStep(request),
  )(request);

/**
 * Checks if the user is onboarded; if not, redirects the user to the onboarding
 * page.
 *
 * @param user - The OnboardingUser object.
 * @returns The user object if onboarded.
 */
export const throwIfUserNeedsOnboarding = (user: OnboardingUser) => {
  if (getUserIsOnboarded(user)) {
    return user;
  }

  throw redirect('/onboarding');
};

/**
 * Returns a user profile with their active organization memberships for a given
 * user id and request.
 *
 * @param request - A Request object.
 * @returns A user's profile with their organization memberships.
 * @throws A redirect to the login page if the user does NOT exist.
 * @throws A redirect to the onboarding page if the user needs onboarding.
 */
export const requireOnboardedUserProfileExists = asyncPipe(
  requireUserExists,
  throwIfUserNeedsOnboarding,
);
