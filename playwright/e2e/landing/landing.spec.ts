import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { deleteUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import {
  getPath,
  loginAndSaveUserProfileToDatabase,
  setupOrganizationAndLoginAsMember,
} from '../../utils';

test.describe('landing page', () => {
  test('given a logged out user: the page shows the landing page content', async ({
    page,
  }) => {
    await page.goto('/');

    // Page has the correct title and heading.
    expect(await page.title()).toMatch(/french house stack/i);
    await expect(
      page.getByRole('heading', { name: /french house stack/i }),
    ).toBeVisible();
  });

  test('given a logged in user that is NOT onboarded: redirects the user to the onboarding page', async ({
    page,
  }) => {
    const { id } = await loginAndSaveUserProfileToDatabase({ name: '', page });

    await page.goto('/');
    expect(getPath(page)).toEqual('/onboarding/user-profile');

    await page.close();
    await deleteUserProfileFromDatabaseById(id);
  });

  test("given a logged in user that is onboarded: redirects the user to their first organization's page", async ({
    page,
  }) => {
    const { user, organization } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/');
    expect(getPath(page)).toEqual(`/organizations/${organization.slug}/home`);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
