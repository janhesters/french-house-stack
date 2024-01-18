import { expect, test } from '@playwright/test';

import { deleteUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import {
  getPath,
  loginAndSaveUserProfileToDatabase,
  setupOrganizationAndLoginAsMember,
} from '../../utils';

test.describe('settings root page', () => {
  test('given a logged out user: redirects the user to the login page', async ({
    page,
  }) => {
    await page.goto('/settings');
    const searchParams = new URLSearchParams();
    searchParams.append('redirectTo', '/settings/profile');
    expect(getPath(page)).toEqual(`/login?${searchParams.toString()}`);
  });

  test('given a logged in user who is NOT onboarded: redirects the user to the onboarding page', async ({
    page,
  }) => {
    const user = await loginAndSaveUserProfileToDatabase({ name: '', page });

    await page.goto('/settings');
    expect(getPath(page)).toEqual('/onboarding/user-profile');

    await deleteUserProfileFromDatabaseById(user.id);
  });

  test('given a logged in user who is onboarded: redirects the user to the user profile page and renders a nav bar', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/settings');
    expect(getPath(page)).toEqual('/settings/profile');

    await teardownOrganizationAndMember({ organization, user });
  });
});
