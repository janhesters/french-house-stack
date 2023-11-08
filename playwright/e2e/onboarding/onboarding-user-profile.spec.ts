import AxeBuilder from '@axe-core/playwright';
import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  retrieveUserProfileFromDatabaseById,
} from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import {
  getPath,
  loginAndSaveUserProfileToDatabase,
  setupOrganizationAndLoginAsMember,
} from '../../utils';

test.describe('onboarding user profile page', () => {
  test('given a logged out user: redirects the user to the login page and remembers the page as the redirectTo query parameter', async ({
    page,
  }) => {
    await page.goto(`/onboarding/user-profile`);
    const searchParams = new URLSearchParams();
    searchParams.append('redirectTo', '/onboarding/user-profile');
    expect(getPath(page)).toEqual(`/login?${searchParams.toString()}`);
  });

  test("given a logged in user that is already onboarded: redirects the user to their first organization's home page", async ({
    page,
  }) => {
    const { user, organization } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/onboarding/user-profile');
    expect(getPath(page)).toEqual(`/organizations/${organization.slug}/home`);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given a logged in user which has a name but has no organization: redirects the user to the organization onboarding page', async ({
    page,
  }) => {
    const user = await loginAndSaveUserProfileToDatabase({ page });

    await page.goto('/onboarding/user-profile');
    expect(getPath(page)).toEqual('/onboarding/organization');

    await page.close();
    await deleteUserProfileFromDatabaseById(user.id);
  });

  test('given a logged in user who lacks a name and is no member of any organization: lets the user pick their name then redirects to the organization onboarding page', async ({
    page,
  }) => {
    const user = await loginAndSaveUserProfileToDatabase({ name: '', page });

    await page.goto('/onboarding/user-profile');

    // The page has the correct title.
    expect(await page.title()).toMatch(/onboarding user profile/i);

    // The page has the correct headings and description.
    await expect(
      page.getByRole('heading', { name: /onboarding/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /onboarding user profile/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: /create your profile/i,
        level: 3,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        /welcome to the french house stack! please create your user profile to get started./i,
      ),
    ).toBeVisible();

    // The user can fill in the form with valid data and submit it.
    const newName = createPopulatedUserProfile().name;
    await page.getByLabel(/name/i).fill(newName);
    await page.getByRole('button', { name: /save/i }).click();

    // The page redirects to the organization onboarding page.
    await page.waitForURL('/onboarding/organization');

    // The user is updated with the name.
    const updatedUser = await retrieveUserProfileFromDatabaseById(user.id);
    expect(updatedUser?.name).toEqual(newName);

    await page.close();
    await deleteUserProfileFromDatabaseById(user.id);
  });

  test("given a logged in user who is onboarded and is a member of organizations, but lacks a name: lets the user pick their name then redirects to their organization's home page", async ({
    page,
  }) => {
    const { user, organization } = await setupOrganizationAndLoginAsMember({
      page,
      user: createPopulatedUserProfile({ name: '' }),
    });

    await page.goto('/onboarding/user-profile');

    // The page has the correct title.
    expect(await page.title()).toMatch(/onboarding user profile/i);

    // The page has the correct headings and description.
    await expect(
      page.getByRole('heading', { name: /onboarding/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /onboarding user profile/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: /create your profile/i,
        level: 3,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        /welcome to the french house stack! please create your user profile to get started./i,
      ),
    ).toBeVisible();

    // The user can fill in the form with valid data and submit it.
    const newName = createPopulatedUserProfile().name;
    await page.getByLabel(/name/i).fill(newName);
    await page.getByRole('button', { name: /save/i }).click();

    // The page redirects to the organization's home page.
    await page.waitForURL(`/organizations/${organization.slug}/home`);

    // The user is updated with the name.
    const updatedUser = await retrieveUserProfileFromDatabaseById(user.id);
    expect(updatedUser?.name).toEqual(newName);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given a logged in user who lacks a name and entering invalid data: shows the correct error messages', async ({
    page,
  }) => {
    const user = await loginAndSaveUserProfileToDatabase({ name: '', page });

    await page.goto('/onboarding/user-profile');

    // The user can fill in the form with invalid data and submit it.
    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // The organization name input shows the correct error messages.
    await expect(
      page.getByText(/your name must be at least 2 characters long./i),
    ).toBeVisible();
    const nameInput = page.getByLabel(/name/i);
    await nameInput.fill('   a   ');
    await saveButton.click();
    await expect(
      page.getByText(/your name must be at least 2 characters long./i),
    ).toBeVisible();
    await nameInput.fill(faker.string.alpha(129));
    await expect(
      page.getByText(/your name must be at most 128 characters long./i),
    ).toBeVisible();
    await saveButton.click();

    await page.close();
    await deleteUserProfileFromDatabaseById(user.id);
  });

  test('given a logged in user who lacks a name and is no member of any organization: page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    const user = await loginAndSaveUserProfileToDatabase({ name: '', page });

    await page.goto('/onboarding/user-profile');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    await page.close();
    await deleteUserProfileFromDatabaseById(user.id);
  });
});
