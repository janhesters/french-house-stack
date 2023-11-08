import { expect, test } from '@playwright/test';

import { deleteUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';

import { getPath, loginAndSaveUserProfileToDatabase } from '../../utils';

test.describe('onboarding page', () => {
  test('given a logged in user that is NOT onboarded: redirects the user to the user profile onboarding page', async ({
    page,
  }) => {
    const { id } = await loginAndSaveUserProfileToDatabase({ name: '', page });

    await page.goto(`/onboarding`);
    expect(getPath(page)).toEqual('/onboarding/user-profile');

    await page.close();
    await deleteUserProfileFromDatabaseById(id);
  });
});
