/* eslint-disable unicorn/no-null */
import { createId } from '@paralleldrive/cuid2';
import type { Organization, UserProfile } from '@prisma/client';

import type { OnboardingUser } from '~/features/onboarding/onboarding-helpers.server';
import type { OrganizationMembershipRole } from '~/features/organizations/organizations-constants';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';
import {
  addMembersToOrganizationInDatabaseById,
  deleteOrganizationFromDatabaseById,
  saveOrganizationToDatabase,
} from '~/features/organizations/organizations-model.server';
import { saveUserAuthSessionToDatabase } from '~/features/user-authentication/user-auth-session-model.server';
import { createCookieForUserAuthSession } from '~/features/user-authentication/user-authentication-session.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import type { Factory } from '~/utils/types';

export { generateRandomDid } from './generate-random-did.server';
export { toFormData } from '~/utils/to-form-data';

/**
 * Saves the user profile and organization to the database and adds the user as
 * a member of the organization.
 *
 * @param options - Optional parameter containing the organization and user
 * objects to be saved.
 * @returns - An object containing the saved organization and user.
 */
export async function setupUserWithOrgAndAddAsMember({
  organization = createPopulatedOrganization(),
  user = createPopulatedUserProfile(),
  role = ORGANIZATION_MEMBERSHIP_ROLES.MEMBER as OrganizationMembershipRole,
} = {}) {
  // Save user profile and organization and add user as a member.
  await Promise.all([
    saveUserProfileToDatabase(user),
    saveOrganizationToDatabase(organization),
  ]);
  await addMembersToOrganizationInDatabaseById({
    id: organization.id,
    members: [user.id],
    role,
  });

  return { organization, user };
}

/**
 * Deletes an organization and a user from the database.
 *
 * @param params - The organization and user to delete.
 * @returns  A Promise that resolves when the organization and user profile
 * have been removed from the database.
 */
export async function teardownOrganizationAndMember({
  organization,
  user,
}: {
  organization: Organization;
  user: UserProfile;
}) {
  await deleteOrganizationFromDatabaseById(organization.id);
  await deleteUserProfileFromDatabaseById(user.id);
}

const ONE_YEAR_IN_SECONDS = 1000 * 60 * 60 * 24 * 365;

/**
 * Creates an authenticated request object with the given parameters and a user
 * auth session behind the scenes.
 *
 * @param options - An object containing the url and user id as well as optional
 * form data.
 * @returns A Promise that resolves to an authenticated Request object.
 */
export async function createAuthenticatedRequest({
  url,
  userId,
  method = 'POST',
  formData,
}: {
  url: string;
  userId: string;
  method?: string;
  formData?: FormData;
}) {
  const request = new Request(url, { method, body: formData });
  const userAuthSession = await saveUserAuthSessionToDatabase({
    expirationDate: new Date(Date.now() + ONE_YEAR_IN_SECONDS),
    id: createId(),
    userId,
  });
  request.headers.set(
    'Cookie',
    await createCookieForUserAuthSession({
      request,
      userAuthSessionId: userAuthSession.id,
    }),
  );
  return request;
}

/**
 * Removes the 'Secure' and 'SameSite' attributes from the 'Set-Cookie' header
 * of the given request.
 *
 * This function is needed for tests that invole flash messages because for
 * some reason in the tests they look different than when you run the app.
 *
 * @param request - The request to remove the cookie attributes from.
 * @returns A new request with the cookie attributes removed.
 */
export function clearCookieAttributes(request: Request): Request {
  const cookies = request.headers.get('Cookie');

  if (!cookies) {
    return request;
  }

  const cleanedCookies = cookies
    .split(', ')
    .map(cookie => cookie.split(';')[0])
    .join('; ');

  const newRequest = new Request(request);
  newRequest.headers.set('Cookie', cleanedCookies);

  return newRequest;
}

/**
 * A factory function for creating an onboarded user with their memberships.
 *
 * @param props - The properties of the onboarding user.
 * @returns An onboarding user.
 */
export const createUserWithOrganizations: Factory<OnboardingUser> = ({
  memberships = [
    {
      role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      organization: createPopulatedOrganization(),
      deactivatedAt: null,
    },
    {
      role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      organization: createPopulatedOrganization(),
      deactivatedAt: null,
    },
    {
      role: ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      organization: createPopulatedOrganization(),
      deactivatedAt: null,
    },
  ],
  ...props
} = {}) => ({ ...createPopulatedUserProfile(), ...props, memberships });
