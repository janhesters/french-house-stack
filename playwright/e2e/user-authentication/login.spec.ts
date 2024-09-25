import 'dotenv/config';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import { getPath, setupOrganizationAndLoginAsMember } from '../../utils';

test.describe('login page', () => {
  test("given an onboarded user: redirects to the user's first organization's home page", async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/login');
    expect(getPath(page)).toEqual(`/organizations/${organization.slug}/home`);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given a logged out user and entering invalid data: shows the correct error messages', async ({
    page,
  }) => {
    await page.goto('/login');

    // The user can fill in the form with invalid data and submit it.
    const loginButton = page.getByRole('button', { name: /login/i });
    await loginButton.click();

    // The email input shows the correct error messages.
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();

    // Invalid email.
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('invalid email');
    await loginButton.click();
    await expect(
      page.getByText(/a valid email consists of characters, '@' and '.'./i),
    ).toBeVisible();

    // User does not exist.
    await emailInput.fill(createPopulatedUserProfile().email);
    await loginButton.click();
    await expect(
      page.getByText(
        /user with given email doesn't exist. did you mean to create a new account instead?/i,
      ),
    ).toBeVisible();

    // The register button has the correct link.
    await expect(
      page.getByRole('link', { name: /create your account/i }),
    ).toHaveAttribute('href', '/register');
  });

  test('given a logged out user and an invite link token in the url: changes the register redirect button to also include the token', async ({
    page,
  }) => {
    // Navigate to the login page with a token.
    await page.goto(`/login?token=1234`);

    // The register button has the correct link.
    await expect(
      page.getByRole('link', { name: /create your account/i }),
    ).toHaveAttribute('href', '/register?token=1234');
  });

  test('page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
