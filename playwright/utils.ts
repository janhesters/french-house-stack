import 'dotenv/config';

import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { installGlobals } from '@remix-run/node';
import { parse } from 'cookie';

import {
  createUserSession,
  USER_AUTHENTICATION_SESSION_NAME,
} from '~/features/user-authentication/user-authentication-session.server';
import type { PartialUserProfileParameters } from '~/features/user-profile/user-profile-model.server';
import { saveUserProfileToDatabase } from '~/features/user-profile/user-profile-model.server';
import generateRandomDid from '~/test/generate-random-did';

installGlobals();

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
  const response = await createUserSession({
    redirectTo: '/',
    remember: false,
    request: new Request('http://localhost:3000/'),
    userId: id,
  });
  const cookieValue = response.headers.get('Set-Cookie');

  if (!cookieValue) {
    throw new Error('Cookie missing from createUserSession response');
  }

  const parsedCookie = parse(cookieValue);
  const token = parsedCookie[USER_AUTHENTICATION_SESSION_NAME];
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
}: Partial<PartialUserProfileParameters> & { page: Page }) {
  await loginByCookie({ id, page });
  return await saveUserProfileToDatabase({ avatar, email, id, name });
}
