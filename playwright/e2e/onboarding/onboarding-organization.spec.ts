import AxeBuilder from '@axe-core/playwright';
import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';
import { retrieveOrganizationWithMembersFromDatabaseBySlug } from '~/features/organizations/organizations-model.server';
import { deleteUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import {
  getPath,
  loginAndSaveUserProfileToDatabase,
  setupOrganizationAndLoginAsMember,
} from '../../utils';

test.describe('onboarding organization page', () => {
  test('given a logged out user: redirects the user to the login page and remembers the page as the redirectTo query parameter', async ({
    page,
  }) => {
    await page.goto(`/onboarding/organization`);
    const searchParams = new URLSearchParams();
    searchParams.append('redirectTo', `/onboarding/organization`);
    expect(getPath(page)).toEqual(`/login?${searchParams.toString()}`);
  });

  test("given a logged in user that is already onboarded: redirects the user to their first organization's home page", async ({
    page,
  }) => {
    const { user, organization } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/onboarding/organization');
    expect(getPath(page)).toEqual(`/organizations/${organization.slug}/home`);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given a logged in user which has lacks a name: redirects the user to the user profile onboarding page', async ({
    page,
  }) => {
    const user = await loginAndSaveUserProfileToDatabase({ name: '', page });

    await page.goto('/onboarding/organization');
    expect(getPath(page)).toEqual(`/onboarding/user-profile`);

    await page.close();
    await deleteUserProfileFromDatabaseById(user.id);
  });

  test('given a logged in user who has a name and is no member of any organization: lets the user create their organization, then redirects to the organization onboarding page', async ({
    page,
  }) => {
    const user = await loginAndSaveUserProfileToDatabase({ page });

    await page.goto('/onboarding/organization');

    // The page has the correct title.
    expect(await page.title()).toMatch(/onboarding organization/i);

    // The page has the correct headings and description.
    await expect(
      page.getByRole('heading', { name: /onboarding/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /onboarding organization/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: /create your organization/i,
        level: 3,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        /you can invite other users to join your organization later/i,
      ),
    ).toBeVisible();

    // The user can fill in the form with valid data and submit it.
    const { name: newName, slug: newSlug } = createPopulatedOrganization();
    await page.getByLabel(/organization name/i).fill(newName);
    await page.getByRole('button', { name: /save/i }).click();

    // The page redirects to the organization's home page.
    await page.waitForURL(`/organizations/${newSlug}/home`);

    // The organization is created in the database, the user is an owner and
    // assigned themselves to the organization.
    const createdOrganization =
      await retrieveOrganizationWithMembersFromDatabaseBySlug(newSlug);
    expect(createdOrganization).toMatchObject({ name: newName, slug: newSlug });
    expect(createdOrganization!.memberships[0].member).toEqual(user);
    expect(createdOrganization!.memberships[0].role).toEqual(
      ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
    );

    await page.close();
    await deleteUserProfileFromDatabaseById(user.id);
  });

  test('given a logged in user who has a name and is no member of any organization and entering invalid data: shows the correct error messages', async ({
    page,
  }) => {
    const user = await loginAndSaveUserProfileToDatabase({ page });

    await page.goto('/onboarding/organization');

    // The user can fill in the form with invalid data and submit it.
    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // The organization name input shows the correct error messages.
    await expect(
      page.getByText(
        /your organization name must be at least 3 characters long./i,
      ),
    ).toBeVisible();
    const organizationNameInput = page.getByLabel(/organization name/i);
    await organizationNameInput.fill('  a  ');
    await saveButton.click();
    await expect(
      page.getByText(
        /your organization name must be at least 3 characters long./i,
      ),
    ).toBeVisible();
    await organizationNameInput.fill(faker.string.alpha(256));
    await expect(
      page.getByText(
        /your organization name must be at most 255 characters long./i,
      ),
    ).toBeVisible();
    await saveButton.click();

    await page.close();
    await deleteUserProfileFromDatabaseById(user.id);
  });

  test('given a logged in user that has a name and is no member of any organization: page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    const user = await loginAndSaveUserProfileToDatabase({ page });

    await page.goto('/onboarding/organization');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    await page.close();
    await deleteUserProfileFromDatabaseById(user.id);
  });
});
