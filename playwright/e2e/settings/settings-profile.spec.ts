import AxeBuilder from '@axe-core/playwright';
import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import { retrieveUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import { getPath, setupOrganizationAndLoginAsMember } from '../../utils';

test.describe('settings profile page', () => {
  test('given a logged out user: redirects the user to the login page', async ({
    page,
  }) => {
    await page.goto('/settings/profile');
    const searchParams = new URLSearchParams();
    searchParams.append('redirectTo', '/settings/profile');
    expect(getPath(page)).toEqual(`/login?${searchParams.toString()}`);
  });

  test('given a logged in user who is NOT onboarded: redirects the user to the onboarding page', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      user: createPopulatedUserProfile({ name: '' }),
      page,
    });

    await page.goto('/settings/profile');
    expect(getPath(page)).toEqual('/onboarding/user-profile');

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded user: lets the user edit their profile', async ({
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

    await page.goto('/settings/profile');

    // The page has the correct title.
    expect(await page.title()).toMatch(/profile/i);

    // The page has the correct headings and description.
    await expect(
      page.getByRole('heading', { name: /settings/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /profile/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByText(/this is how others will see you in this app./i),
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

    // The user can fill in the form with valid data and submit it.
    const newName = faker.person.fullName();
    await page.getByLabel(/name/i).fill(newName);
    await page.getByRole('button', { name: /save/i }).click();

    // It shows a success toast message.
    await expect(page.getByRole('status')).toHaveText(
      /profile has been updated/i,
    );

    // The user is updated with the name.
    const updatedUser = await retrieveUserProfileFromDatabaseById(user.id);
    expect(updatedUser?.name).toEqual(newName);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded user, but entering invalid data: shows the correct error messages', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/settings/profile');

    // The name input shows the correct error messages.
    const nameInput = page.getByLabel(/name/i);
    await nameInput.fill('   a   ');
    const saveButton = page.getByRole('button', { name: /save/i });
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
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded user: page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/settings/profile');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });
});
