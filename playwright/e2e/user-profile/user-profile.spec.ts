import AxeBuilder from '@axe-core/playwright';
import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { deleteUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';

import { loginAndSaveUserProfileToDatabase } from '../../utils';

test.describe('user profile page', () => {
  test("page redirects you to the login page when you're logged out and remembers the page as the redirectTo query parameter", async ({
    page,
    baseURL,
  }) => {
    await page.goto('./settings/profile');
    const expectedUrl = new URL(baseURL + '/login');
    expectedUrl.searchParams.append('redirectTo', '/settings/profile');
    expect(page.url()).toEqual(expectedUrl.href);
  });

  test("page allows a logged in user to change their user's email", async ({
    page,
  }) => {
    const user = await loginAndSaveUserProfileToDatabase({ page });
    await page.goto('./settings/profile');

    // The page has the correct title, headings and description.
    expect(await page.title()).toEqual('Profile | French House Stack');
    await expect(
      page.getByRole('heading', { name: /settings/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /profile/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByText(/information will be displayed publicly/i),
    ).toBeVisible();

    // It renders the user's email address.
    await expect(page.getByText(user.email)).toBeVisible();

    // It renders the user's name.
    const nameInput = page.getByLabel(/name/i);
    expect(await nameInput.inputValue()).toEqual(user.name);

    // It shows the proper error messages for the name input.
    await nameInput.fill('');
    const saveButton = page.getByRole('button', { name: /save/i });
    await nameInput.fill('ab');
    await saveButton.click();
    await expect(
      page.getByText(/must be at least 3 characters/i),
    ).toBeVisible();

    // It doesn't show a success message when the form is submitted with errors.
    await expect(page.getByRole('alert', { name: /success/i })).toBeHidden();

    // It lets the user change their name.
    const newName = faker.name.fullName();
    await nameInput.fill(newName);
    await saveButton.click();

    // It shows a success notification that the user can dismiss.
    await expect(page.getByRole('alert', { name: /success/i })).toBeVisible();
    await page.getByRole('link', { name: /dismiss/i }).click();
    await expect(page.getByRole('alert', { name: /success/i })).toBeHidden();

    // Verify that saving the value worked.
    await page.reload();
    expect(await nameInput.inputValue()).toEqual(newName);

    await page.close();
    await deleteUserProfileFromDatabaseById(user.id);
  });

  test('given there is no user profile for the given user: renders a message to the user', ({}, testInfo) => {
    testInfo.fixme();
  });

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    const { id } = await loginAndSaveUserProfileToDatabase({ page });
    await page.goto('./settings/profile');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    await page.close();
    await deleteUserProfileFromDatabaseById(id);
  });
});
