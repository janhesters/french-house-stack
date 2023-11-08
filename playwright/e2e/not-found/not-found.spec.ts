import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { deleteUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';

import { getPath, loginAndSaveUserProfileToDatabase } from '../../utils';

test.describe('not found page', () => {
  test('given a logged out user: the page renders the correct title and a useful error message and a link that redirects the user to the landing page', async ({
    page,
  }) => {
    await page.goto('/some-non-existing-url');

    // It has the correct title and header.
    expect(await page.title()).toEqual('404 Not Found | French House Stack');
    await expect(
      page.getByRole('heading', { name: /page not found/i, level: 1 }),
    ).toBeVisible();

    // It renders a link to navigate to the landing page.
    await page.getByRole('link', { name: /home/i }).click();
    expect(getPath(page)).toEqual('/');
  });

  test('given a logged in user that is NOT onboarded: the page renders a link that redirects the user to the onboarding page', async ({
    page,
  }) => {
    const { id } = await loginAndSaveUserProfileToDatabase({ name: '', page });
    await page.goto('/some-non-existing-url');

    // Clicking the home button navigates the user to the onboarding page.
    await page.getByRole('link', { name: /home/i }).click();
    expect(getPath(page)).toEqual(`/onboarding/user-profile`);

    await page.close();
    await deleteUserProfileFromDatabaseById(id);
  });

  test('page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/some-non-existing-url');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
