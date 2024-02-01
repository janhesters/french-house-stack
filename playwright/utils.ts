import 'dotenv/config';

import { createId } from '@paralleldrive/cuid2';
import type { APIResponse, Page } from '@playwright/test';
import type { Organization, UserProfile } from '@prisma/client';
import { installGlobals } from '@remix-run/node';
import { parse } from 'cookie';
import { promiseHash } from 'remix-utils/promise';

import type { OrganizationMembershipRole } from '~/features/organizations/organizations-constants';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';
import {
  addMembersToOrganizationInDatabaseById,
  saveOrganizationToDatabase,
} from '~/features/organizations/organizations-model.server';
import { saveUserAuthSessionToDatabase } from '~/features/user-authentication/user-auth-session-model.server';
import {
  createCookieForUserAuthSession,
  USER_AUTHENTICATION_SESSION_NAME,
} from '~/features/user-authentication/user-authentication-session.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import { saveUserProfileToDatabase } from '~/features/user-profile/user-profile-model.server';
import { generateRandomDid } from '~/test/generate-random-did.server';

installGlobals();

/**
 * Generates a token that can be used within a cookie to authenticate a user.
 *
 * @param userAuthSessionId - The id of the user authentication session to
 * create the token for.
 * @returns A signed token to add as a cookie to a request.
 */
export async function createValidCookieToken(userAuthSessionId: string) {
  const cookieValue = await createCookieForUserAuthSession({
    request: new Request('http://localhost:3000/'),
    userAuthSessionId,
  });
  const parsedCookie = parse(cookieValue);
  const token = parsedCookie[USER_AUTHENTICATION_SESSION_NAME];
  return token;
}

/**
 * Adds a cookie to the page's browser context to log the user with the given id
 * in.
 *
 * @param options - The id of the user authentication session to log in and and
 * the test's page.
 */
export async function loginByCookie({
  userAuthSessionId = createId(),
  page,
}: {
  userAuthSessionId?: string;
  page: Page;
}) {
  const token = await createValidCookieToken(userAuthSessionId);
  await page.context().addCookies([
    {
      name: USER_AUTHENTICATION_SESSION_NAME,
      value: token,
      domain: 'localhost',
      path: '/',
    },
  ]);
}

export const ONE_YEAR_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 365;

/**
 * Creates and logs in a user with a user auth session via cookie for the given
 * page.
 *
 * @param params - The did, email, name and id of the user to create and the
 * test's page.
 * @returns The user profile that was created.
 */
export async function loginAndSaveUserProfileToDatabase({
  acceptedTermsAndConditions = true,
  did = generateRandomDid(),
  email = createPopulatedUserProfile().email,
  id = createId(),
  name = createPopulatedUserProfile().name,
  page,
}: Partial<Parameters<typeof saveUserProfileToDatabase>[0]> & { page: Page }) {
  const user = await saveUserProfileToDatabase({
    acceptedTermsAndConditions,
    did,
    email,
    id,
    name,
  });
  const { id: userAuthSessionId } = await saveUserAuthSessionToDatabase({
    expirationDate: new Date(Date.now() + ONE_YEAR_IN_MILLISECONDS),
    id: createId(),
    userId: user.id,
  });
  await loginByCookie({ page, userAuthSessionId });
  return user;
}

/**
 * Creates an organization and a user, adds that user as a member of the
 * organization, and logs in the user via cookie for the given page.
 *
 * @param params - The organization and user to create and the test's page.
 * @returns The organization and user that were created.
 */
export async function setupOrganizationAndLoginAsMember({
  organization = createPopulatedOrganization(),
  page,
  user = createPopulatedUserProfile(),
  role = ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
}: {
  organization?: Organization;
  page: Page;
  user?: UserProfile;
  role?: OrganizationMembershipRole;
}) {
  const data = await promiseHash({
    user: loginAndSaveUserProfileToDatabase({ page, ...user }),
    organization: saveOrganizationToDatabase(organization),
  });
  await addMembersToOrganizationInDatabaseById({
    id: data.organization.id,
    members: [data.user.id],
    role,
  });
  return data;
}

/**
 * Returns the pathname with the search of a given page's url.
 *
 * @param page - The page to get the path of.
 * @returns The path of the page's url.
 */
export const getPath = (page: Page) => {
  const url = new URL(page.url());
  return `${url.pathname}${url.search}`;
};

/**
 * Converts a given Buffer to JSON by decoding the buffer and parsing the JSON
 * string.
 *
 * @param buffer - The input buffer to be converted.
 * @returns A JSON object representing the data contained in the buffer.
 */
const bufferToJson = (buffer: Buffer) => JSON.parse(buffer.toString());

/**
 * Retrieves JSON data from an APIResponse by reading its body and converting
 * the resulting buffer to JSON.
 *
 * @param response - The APIResponse object containing the response data.
 * @returns A promise that resolves to a JSON object representing the data
 * contained in the API response.
 *
 * @example
 *
 * ```ts
 * test('given a GET request: returns a 200 with a message', async ({ request }) => {
 *   const response = await request.get(url);
 *
 *   expect(response.ok()).toEqual(false);
 *   expect(response.status()).toEqual(200);
 *   expect(await getJson(response)).toEqual({ message: 'success' });
 * });
 * ```
 */
export const getJson = (response: APIResponse) =>
  response.body().then(bufferToJson);
