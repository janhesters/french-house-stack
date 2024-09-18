import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';
import {
  addMembersToOrganizationInDatabaseById,
  saveOrganizationToDatabase,
} from '~/features/organizations/organizations-model.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import { saveUserProfileToDatabase } from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import { getPath, setupOrganizationAndLoginAsMember } from '../../utils';

test.describe('organization billing settings page', () => {
  test('given a logged out user: redirects the user to the login page', async ({
    page,
  }) => {
    const { slug } = createPopulatedOrganization();
    await page.goto(`/organizations/${slug}/settings/billing`);
    const searchParams = new URLSearchParams();
    searchParams.append(
      'redirectTo',
      `/organizations/${slug}/settings/billing`,
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

    await page.goto(`/organizations/${organization.slug}/settings/billing`);
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
      `/organizations/${otherOrganization.slug}/settings/billing`,
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

    await page.goto(`/organizations/${organization.slug}/settings/billing`);

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

    // The page shows a nav bar.
    const navBar = page.getByRole('navigation', {
      name: /settings navigation/i,
    });
    await expect(
      navBar.getByRole('link', { name: /general/i }),
    ).toHaveAttribute(
      'href',
      `/organizations/${organization.slug}/settings/profile`,
    );
    await expect(
      navBar.getByRole('link', { name: /team members/i }),
    ).toHaveAttribute(
      'href',
      `/organizations/${organization.slug}/settings/team-members`,
    );
    await expect(
      navBar.getByRole('link', { name: /billing/i }),
    ).toHaveAttribute(
      'href',
      `/organizations/${organization.slug}/settings/billing`,
    );

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test.describe('organization is on the free tier', () => {
    //
  });

  test('given an onboarded user: page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto(`/organizations/${organization.slug}/settings/billing`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });
});

// NOTE: If a user redirects to the pricing page from an organization,
// that data should be saved in the URL, so that the user can upgrade their
// organization.
// TODO: test that only owners can manage the subscription.
// - on the free plan, they should get to the pricing page.
// - on the pro plan, they should get to the stripe checkout session.
// TODO: make sure that owners can cancel the subscription.
// TODO: test that an anonymous user by paying, gets an account created.
// TODO: test that a user with an organization on a free plan can upgrade.
// TODO: Write the E2E tests for the contact sales page.
// TODO: Write the integration tests for the contact sales page.
// TODO: write the integration tests for the billing page.
// TODO: write the integration tests for the pricing page.
