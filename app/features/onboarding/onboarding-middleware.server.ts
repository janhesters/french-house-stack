import type { LoaderFunctionArgs } from '@remix-run/node';

import {
  requireOnboardedUserProfileExists,
  requireUserNeedsOnboarding,
} from './onboarding-helpers.server';

/**
 * Enriches an existing middleware object with a user that isn't fully
 * onboarded.
 *
 * @param object - A middleware object.
 * @returns A new middleware object with the same properties as the input
 * object, plus a user that isn't fully onboarded.
 * @throws A redirect to the login page if the user does NOT exist, or
 * a redirect to the organizations page if the user does NOT need onboarding.
 */
export const withUserRequiringOnboarding = async <
  T extends Pick<LoaderFunctionArgs, 'request'>,
>({
  request,
  ...rest
}: T) => ({
  request,
  user: await requireUserNeedsOnboarding(request),
  ...rest,
});

/**
 * Enriches an existing middleware object with a user and their organization
 * memberships.
 *
 * @param object - A middleware object.
 * @returns A new middleware object with the same properties as the input
 * object, plus a user and their organization memberships.
 * @throws A redirect to the login page if the user does NOT exist, or
 * a redirect to the onboarding page if the user needs onboarding.
 */
export const withOnbaordedUser = async <
  T extends Pick<LoaderFunctionArgs, 'request' | 'params'>,
>({
  request,
  ...rest
}: T) => ({
  request,
  user: await requireOnboardedUserProfileExists(request),
  ...rest,
});
