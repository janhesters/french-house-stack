import 'dotenv/config';

import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { installGlobals } from '@remix-run/node';
import { parse } from 'cookie';

import {
  createUserSession,
  USER_AUTHENTICATION_SESSION_NAME,
} from '~/features/user-authentication/user-authentication-session.server';
import { saveUserProfileToDatabase } from '~/features/user-profile/user-profile-model.server';
import { generateRandomDid } from '~/test/generate-random-did.server';

installGlobals();

/**
 * Generates a token that can be used within a cookie to authenticate a user.
 *
 * @param userId - The id (decentralized identity token) of the user to create
 * the token for.
 * @returns A signed token to add as a cookie to a request.
 */
export async function createValidCookieToken(userId: string) {
  const response = await createUserSession({
    redirectTo: '/',
    remember: false,
    request: new Request('http://localhost:3000/'),
    userId,
  });
  const cookieValue = response.headers.get('Set-Cookie');

  if (!cookieValue) {
    throw new Error('Cookie missing from createUserSession response');
  }

  const parsedCookie = parse(cookieValue);
  const token = parsedCookie[USER_AUTHENTICATION_SESSION_NAME];
  return token;
}

/**
 * Adds a cookie to the page's browser context to log the user with the given id
 * in.
 *
 * @param options - The id of the user to log in and and the test's page.
 */
export async function loginByCookie({
  id = generateRandomDid(),
  page,
}: {
  id?: string;
  page: Page;
}) {
  const token = await createValidCookieToken(id);
  await page.context().addCookies([
    {
      name: USER_AUTHENTICATION_SESSION_NAME,
      value: token,
      domain: 'localhost',
      path: '/',
    },
  ]);
}

export async function loginAndSaveUserProfileToDatabase({
  avatar = faker.image.avatar(),
  email = faker.internet.email(),
  id = generateRandomDid(),
  name = faker.name.fullName(),
  page,
}: Partial<Parameters<typeof saveUserProfileToDatabase>[0]> & { page: Page }) {
  await loginByCookie({ id, page });
  return await saveUserProfileToDatabase({ avatar, email, id, name });
}
