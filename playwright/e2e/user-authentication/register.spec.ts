import 'dotenv/config';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import { getPath, setupOrganizationAndLoginAsMember } from '../../utils';

test.describe('register page', () => {
  test("given an onboarded user: redirects to the user's first organization's home page", async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/register');
    expect(getPath(page)).toEqual(`/organizations/${organization.slug}/home`);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given a logged out user and entering invalid data: shows the correct error messages', async ({
    page,
  }) => {
    const user = createPopulatedUserProfile();
    await saveUserProfileToDatabase(user);

    // Navigate to the register page.
    await page.goto('/register');

    // The page has the correct title.
    expect(await page.title()).toEqual('Register | French House Stack');

    // The user can fill in the form with invalid data and submit it.
    const registerButton = page.getByRole('button', { name: /register/i });
    await registerButton.click();

    // The email input shows the correct error messages.
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
    await expect(
      page.getByText(/you must accept the terms and conditions./i),
    ).toBeVisible();

    // Invalid email.
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('invalid email');
    await registerButton.click();
    await expect(
      page.getByText(/a valid email consists of characters, '@' and '.'./i),
    ).toBeVisible();

    // User already exists.
    await emailInput.fill(user.email);
    await page.getByRole('checkbox', { name: /terms and conditions/i }).check();
    await registerButton.click();
    await expect(
      page.getByText(
        /user with given email already exists. did you mean to log in instead?/i,
      ),
    ).toBeVisible();

    // The login button has the correct link.
    await expect(
      page.getByRole('link', { name: /log in to your account/i }),
    ).toHaveAttribute('href', '/login');

    await page.close();
    await deleteUserProfileFromDatabaseById(user.id);
  });

  test('given a logged out user and an invite link token in the url: changes the login redirect button to also include the token', async ({
    page,
  }) => {
    // Navigate to the register page with a token.
    await page.goto(`/register?token=1234`);

    // The login button has the correct link.
    await expect(
      page.getByRole('link', { name: /log in to your account/i }),
    ).toHaveAttribute('href', '/login?token=1234');
  });

  test('page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/register');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('body, button.bg-primary')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
