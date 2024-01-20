import AxeBuilder from '@axe-core/playwright';
import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';
import { retrieveOrganizationWithMembersFromDatabaseBySlug } from '~/features/organizations/organizations-model.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import { getPath, setupOrganizationAndLoginAsMember } from '../../utils';

test.describe('new organization page', () => {
  test('given a logged out user: redirects the user to the login page', async ({
    page,
  }) => {
    await page.goto(`/organizations/new`);
    const searchParams = new URLSearchParams();
    searchParams.append('redirectTo', `/organizations/new`);
    expect(getPath(page)).toEqual(`/login?${searchParams.toString()}`);
  });

  test('given a logged in user who is NOT onboarded: redirects the user to the onboarding page', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
      user: createPopulatedUserProfile({ name: '' }),
    });

    await page.goto(`/organizations/new`);
    expect(getPath(page)).toEqual('/onboarding/user-profile');

    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded user: lets the user create a new organization and redirects to that organizations home page', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto(`/organizations/new`);

    // The page has the correct title.
    expect(await page.title()).toMatch(/create a new organization/i);

    // The page has the correct headings and description.
    await expect(
      page.getByRole('heading', { name: /organizations/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: /create a new organization/i,
        level: 2,
      }),
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

    // The page has the correct user navigation links (open & close click).
    await page.getByRole('button', { name: /open user menu/i }).click();
    await expect(
      page.getByRole('link', { name: /your settings/i }),
    ).toHaveAttribute('href', '/settings');
    await expect(
      page.getByRole('menuitem', { name: /log out/i }),
    ).toBeVisible();
    await page.keyboard.press('Escape');

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

    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded user: shows the correct error messages', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    // Navigate to the new organization page.
    await page.goto(`/organizations/new`);

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

    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded user: page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/organizations/new');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });
});
