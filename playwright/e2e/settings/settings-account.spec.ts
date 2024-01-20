import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { deleteOrganizationFromDatabaseById } from '~/features/organizations/organizations-model.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import { retrieveUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import { getPath, setupOrganizationAndLoginAsMember } from '../../utils';

test.describe('settings account page', () => {
  test('given a logged out user: redirects the user to the login page', async ({
    page,
  }) => {
    await page.goto('/settings/account');
    const searchParams = new URLSearchParams();
    searchParams.append('redirectTo', '/settings/account');
    expect(getPath(page)).toEqual(`/login?${searchParams.toString()}`);
  });

  test('given a logged in user who is NOT onboarded: redirects the user to the onboarding page', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      user: createPopulatedUserProfile({ name: '' }),
      page,
    });

    await page.goto('/settings/account');
    expect(getPath(page)).toEqual('/onboarding/user-profile');

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given a logged in user that is NOT an owner of any organization: lets them delete their account', async ({
    page,
    browserName,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      browserName === 'webkit',
      'Safari (Desktop & Mobile) fails in CI.',
    );
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/settings/account');

    // The page has the correct title.
    expect(await page.title()).toMatch(/account/i);

    // The page has the correct headings and description.
    await expect(
      page.getByRole('heading', { name: /settings/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /account/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByText(/manage your account settings./i),
    ).toBeVisible();

    // The page shows a nav bar.
    const navBar = page.getByRole('navigation', {
      name: /settings navigation/i,
    });
    await expect(
      navBar.getByRole('link', { name: /profile/i }),
    ).toHaveAttribute('href', '/settings/profile');
    await expect(
      navBar.getByRole('link', { name: /account/i }),
    ).toHaveAttribute('href', '/settings/account');

    // The page lets the user delete their account.
    await expect(
      page.getByRole('heading', { name: /delete account/i, level: 3 }),
    ).toBeVisible();
    await page.getByRole('button', { name: /delete your account/i }).click();
    await expect(page.getByText(/are you absolutely sure?/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await page.getByRole('button', { name: /delete your account/i }).click();

    // Verify the user is deleted.
    await page.waitForURL('/');
    const deletedUser = await retrieveUserProfileFromDatabaseById(user.id);
    expect(deletedUser).toEqual(null);

    await page.close();
    await deleteOrganizationFromDatabaseById(organization.id);
  });

  test('given a logged in user that is an owner of an organization: does NOT let them delete their account', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
      role: ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
    });

    await page.goto('/settings/account');

    // The page shows the correct description.
    await expect(
      page.getByText(
        new RegExp(
          `Your account is currently an owner in this organization: ${organization.name}.`,
        ),
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        /you must remove yourself, transfer ownership, or delete this organization before you can delete your user./i,
      ),
    ).toBeVisible();

    // The button to delete the organization is disabled.
    await expect(
      page.getByRole('button', { name: /delete your account/i }),
    ).toBeDisabled();

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded user: page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/settings/account');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });
});
