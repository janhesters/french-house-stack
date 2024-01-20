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

test.describe('organizations settings root page', () => {
  test('given a logged out user: redirects the user to the login page', async ({
    page,
  }) => {
    const { slug } = createPopulatedOrganization();
    await page.goto(`/organizations/${slug}/settings`);
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

    await page.goto(`/organizations/${organization.slug}/settings`);
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

    // Try to visit the settings page of the organization of the other user.
    await page.goto(`/organizations/${otherOrganization.slug}/settings`);

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

  test("given an onboarded user: redirects the user to the organization's profile page", async ({
    page,
  }) => {
    const { user, organization } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto(`/organizations/${organization.slug}/settings`);
    expect(getPath(page)).toEqual(
      `/organizations/${organization.slug}/settings/profile`,
    );

    await page.close();
    await teardownOrganizationAndMember({ user, organization });
  });
});
