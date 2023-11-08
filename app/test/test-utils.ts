import type { Organization, UserProfile } from '@prisma/client';

import { createPopulatedOrganization } from '~/features/organization/organization-factories.server';
import {
  addMembersToOrganizationInDatabaseById,
  deleteOrganizationFromDatabaseById,
  saveOrganizationToDatabase,
} from '~/features/organization/organization-model.server';
import type { OrganizationMembershipRole } from '~/features/organizations/organizations-constants';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { createCookieForUserSession } from '~/features/user-authentication/user-authentication-session-old.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';

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
    assignedBy: user.id,
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

/**
 * Creates an authenticated request object with the given parameters.
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
  request.headers.set(
    'Cookie',
    await createCookieForUserSession({ request, userId, remember: true }),
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
 * Creates a mocked GPT-4 response object for testing purposes.
 * The function generates an object structure similar to what the OpenAI API
 * would return for a chat completion.
 *
 * @param content - The message content for the `'assistant'` role in the chat.
 * Defaults to `'\n\nHello there, how may I assist you today?'`.
 * @returns An object mimicking a typical OpenAI API chat completion response,
 * with the provided content as the assistant's message.
 */
export const createGpt4CompletionResponse = (
  content = '\n\nHello there, how may I assist you today?',
): CreateChatCompletionResponse => ({
  id: 'chatcmpl-123',
  model: 'gpt-4',
  object: 'chat.completion',
  created: 1_677_652_288,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content },
      finish_reason: 'stop',
    },
  ],
  usage: { prompt_tokens: 9, completion_tokens: 12, total_tokens: 21 },
});
