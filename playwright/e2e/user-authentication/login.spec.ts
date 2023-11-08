import 'dotenv/config';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { deleteUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';

import {
  createValidCookieToken,
  loginAndSaveUserProfileToDatabase,
} from '../../utils';

const loginLoaderRoute = '/login?_data=routes%2Flogin';
const invalidMagicEmail = 'test+fail@magic.link';
const validMagicEmail = 'test+success@magic.link';

test.describe('login page', () => {
  test('redirects to the route specified in the search parameter if the user is logged in', async ({
    page,
    baseURL,
  }) => {
    const { id } = await loginAndSaveUserProfileToDatabase({ page });

    const searchParameters = new URLSearchParams({
      redirectTo: '/settings/profile',
    });
    await page.goto('./login?' + searchParameters.toString());
    expect(page.url()).toEqual(baseURL + '/settings/profile');

    await page.close();
    await deleteUserProfileFromDatabaseById(id);
  });

  test('given valid credentials, but no user profile exists for the given email: shows an error', async ({
    page,
  }) => {
    // TODO: user not found. did you mean to create an account instead?
  });
});
