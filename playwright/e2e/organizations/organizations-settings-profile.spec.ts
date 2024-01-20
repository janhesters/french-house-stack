import AxeBuilder from '@axe-core/playwright';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';
import {
  addMembersToOrganizationInDatabaseById,
  retrieveOrganizationFromDatabaseById,
  saveOrganizationToDatabase,
} from '~/features/organizations/organizations-model.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import { getPath, setupOrganizationAndLoginAsMember } from '../../utils';

async function isEffectivelyDisabled(page: Page, selector: string) {
  const isDirectlyDisabled = await page.evaluate(selector => {
    const element = document.querySelector(selector);
    if (element && 'disabled' in element) {
      return element.disabled;
    }

    return false;
  }, selector);

  if (isDirectlyDisabled) {
    return true;
  }

  const isInheritedDisabled = await page.evaluate(selector => {
    const element = document.querySelector(selector);
    let parent = element?.parentElement;

    while (parent) {
      if (
        parent.tagName.toLowerCase() === 'fieldset' &&
        'disabled' in parent &&
        parent.disabled
      ) {
        return true;
      }

      parent = parent.parentElement;
    }

    return false;
  }, selector);

  return isInheritedDisabled;
}

test.describe('organization profile settings page', () => {
  test('given a logged out user: redirects the user to the login page', async ({
    page,
  }) => {
    const { slug } = createPopulatedOrganization();
    await page.goto(`/organizations/${slug}/settings/profile`);
    const searchParams = new URLSearchParams();
    searchParams.append(
      'redirectTo',
      `/organizations/${slug}/settings/profile`,
    );
    expect(getPath(page)).toEqual(`/login?${searchParams.toString()}`);
  });

  test('given a logged in user who is NOT onboarded: redirects the user to the onboarding page', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      user: createPopulatedUserProfile({ name: '' }),
      page,
    });

    await page.goto(`/organizations/${organization.slug}/settings/profile`);
    expect(getPath(page)).toEqual('/onboarding/user-profile');

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded user with an organization slug for an existing organization for which the user is NOT a member: shows a 404 error', async ({
    page,
  }) => {
    // Create user and save their organization.
    const { user, organization } = await setupOrganizationAndLoginAsMember({
      page,
    });

    // Create another user and save their organization.
    const otherUser = createPopulatedUserProfile();
    await saveUserProfileToDatabase(otherUser);
    const otherOrganization = createPopulatedOrganization();
    await saveOrganizationToDatabase(otherOrganization);
    await addMembersToOrganizationInDatabaseById({
      id: otherOrganization.id,
      members: [otherUser.id],
    });

    // Try to visit the profile page of the organization of the other user.
    await page.goto(
      `/organizations/${otherOrganization.slug}/settings/profile`,
    );

    expect(await page.title()).toMatch(/404/i);
    await expect(
      page.getByRole('heading', { name: /page not found/i, level: 1 }),
    ).toBeVisible();
    await expect(page.getByText(/404/i)).toBeVisible();
    await expect(
      page.getByText(/sorry, we couldn't find the page you're looking for/i),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /go back home/i }),
    ).toHaveAttribute('href', '/');

    await page.close();
    await teardownOrganizationAndMember({
      user: otherUser,
      organization: otherOrganization,
    });
    await teardownOrganizationAndMember({ user, organization });
  });

  test('given an onboarded user: the page has the correct headings, description and links', async ({
    page,
    isMobile,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto(`/organizations/${organization.slug}/settings/profile`);

    // The page has the correct title.
    expect(await page.title()).toMatch(/general/i);

    // The page has the correct headings and description.
    await expect(
      page.getByRole('heading', { name: /organization settings/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /general/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByText(/general settings for this organization/i),
    ).toBeVisible();

    // The page has the correct sidebar links.
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (isMobile) {
      // On mobile, open the burger menu.
      await page.getByRole('button', { name: /open sidebar/i }).click();
    }

    const sidebarNav = page.getByRole('navigation', { name: /sidebar/i });
    await expect(
      sidebarNav.getByRole('link', { name: /home/i }),
    ).toHaveAttribute('href', `/organizations/${organization.slug}/home`);
    await expect(
      sidebarNav.getByRole('link', { name: /settings/i }),
    ).toHaveAttribute('href', `/organizations/${organization.slug}/settings`);

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (isMobile) {
      // On mobile, close the burger menu.
      await page.getByRole('button', { name: /close sidebar/i }).click();
    }

    // The page has the correct user navigation links (open & close click).
    await page.getByRole('button', { name: /open user menu/i }).click();
    await expect(
      page.getByRole('link', { name: /your settings/i }),
    ).toHaveAttribute('href', '/settings');
    await expect(
      page.getByRole('menuitem', { name: /log out/i }),
    ).toBeVisible();
    await page.keyboard.press('Escape');

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test("given a logged in user that is a member of the organization: shows the organization's name, but does NOT let the user edit it, and hides the organization deletion functionality", async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto(`/organizations/${organization.slug}/settings/profile`);

    // It disables the organization name input.
    const selector = 'input[name="name"]';
    const isDisabled = await isEffectivelyDisabled(page, selector);
    expect(isDisabled).toEqual(true);
    const nameInput = page.locator(selector);
    await expect(nameInput).toHaveValue(organization.name);

    // It hides the account deletion functionality.
    await expect(
      page.getByRole('heading', { name: /danger zone/i, level: 3 }),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: /delete this organization/i }),
    ).toBeHidden();

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded user that is an admin of the organization: lets the user edit the organization name, but hides the organization deletion functionality', async ({
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
      role: ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
    });

    await page.goto(`/organizations/${organization.slug}/settings/profile`);

    // The user can fill in the form with valid data and submit it.
    const { name: newName, slug: newSlug } = createPopulatedOrganization();
    await page.getByLabel(/organization name/i).fill(newName);
    await expect(
      page.getByText(
        /your organization's public display name. warning: changing your organization's name will break all existing links to your organization./i,
      ),
    ).toBeVisible();
    await page.getByRole('button', { name: /save/i }).click();

    // It redirects with a success toast message.
    await expect(page.getByRole('status')).toHaveText(
      /organization has been updated/i,
    );
    expect(getPath(page)).toEqual(`/organizations/${newSlug}/settings/profile`);

    // It updates the organization with the new name.
    const updatedOrganization = await retrieveOrganizationFromDatabaseById(
      organization.id,
    );
    expect(updatedOrganization?.name).toEqual(newName);
    expect(updatedOrganization?.slug).toEqual(newSlug);

    // It hides the account deletion functionality.
    await expect(
      page.getByRole('heading', { name: /danger zone/i, level: 3 }),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: /delete this organization/i }),
    ).toBeHidden();

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded user that is an owner of the organization: lets the user edit the organization name and shows the organization deletion functionality', async ({
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
      role: ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
    });

    await page.goto(`/organizations/${organization.slug}/settings/profile`);

    // The user can fill in the form with valid data and submit it.
    const { name: newName, slug: newSlug } = createPopulatedOrganization();
    await page.getByLabel(/organization name/i).fill(newName);
    await expect(
      page.getByText(
        /your organization's public display name. warning: changing your organization's name will break all existing links to your organization./i,
      ),
    ).toBeVisible();
    await page.getByRole('button', { name: /save/i }).click();

    // It redirects with a success toast message.
    await expect(page.getByRole('status').nth(0)).toHaveText(
      /organization has been updated/i,
    );
    expect(getPath(page)).toEqual(`/organizations/${newSlug}/settings/profile`);

    // It updates the organization with the new name.
    const updatedOrganization = await retrieveOrganizationFromDatabaseById(
      organization.id,
    );
    expect(updatedOrganization?.name).toEqual(newName);
    expect(updatedOrganization?.slug).toEqual(newSlug);

    // It lets the user delete the organization.
    await expect(
      page.getByRole('heading', { name: /danger zone/i, level: 3 }),
    ).toBeVisible();
    await expect(
      page.getByText(
        /once deleted, it will be gone forever. please be certain./i,
      ),
    ).toBeVisible();
    await page
      .getByRole('button', { name: /delete this organization/i })
      .click();
    await expect(page.getByText(/are you absolutely sure?/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await page
      .getByRole('button', { name: /delete this organization/i })
      .click();

    // Verify the organization is deleted and a toast is shown.
    await expect(
      page.getByRole('heading', { name: /onboarding/i, level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole('status').nth(0)).toHaveText(
      /organization has been deleted/i,
    );
    const deletedOrganization = await retrieveOrganizationFromDatabaseById(
      organization.id,
    );
    expect(deletedOrganization).toEqual(null);

    await page.close();
    await deleteUserProfileFromDatabaseById(user.id);
  });

  test('given an onboarded user who is at least an admin of the organization: shows the correct error messages', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
      role: faker.helpers.arrayElement([
        ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
        ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
      ]),
    });

    await page.goto(`/organizations/${organization.slug}/settings/profile`);

    // The organization name input shows the correct error messages.
    const organizationNameInput = page.getByLabel(/organization name/i);
    await organizationNameInput.clear();
    await organizationNameInput.fill('  a  ');
    const saveButton = page.getByRole('button', { name: /save/i });
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
    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded user: page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto(`/organizations/${organization.slug}/settings/profile`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });
});
