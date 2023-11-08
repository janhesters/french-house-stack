import type { Organization } from '@prisma/client';

import { asyncPipe } from '~/utils/async-pipe';
import { notFound } from '~/utils/http-responses.server';

import type { OnboardingUser } from '../onboarding/onboarding-helpers.server';
import { withOnbaordedUser } from '../onboarding/onboarding-middleware.server';
import type { Params } from './organizations-helpers.server';
import {
  getOrganizationIsInUserMembershipList,
  getOrganizationSlug,
  requireOrganizationBySlugExists,
} from './organizations-helpers.server';

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
}: T) => {
  if (!getOrganizationIsInUserMembershipList(organization.id, user)) {
    throw notFound();
  }

  return { user, organization, ...rest };
};

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
