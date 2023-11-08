import { describe } from 'node:test';

import { expect, test } from '@playwright/test';

import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';
import {
  deleteOrganizationFromDatabaseById,
  saveOrganizationToDatabase,
} from '~/features/organizations/organizations-model.server';
import { deleteUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import {
  getPath,
  loginAndSaveUserProfileToDatabase,
  setupOrganizationAndLoginAsMember,
} from '../../utils';

describe('organizations slug page', () => {
  test('given a logged out user: redirects the user to the login page', async ({
    page,
  }) => {
    const { slug } = createPopulatedOrganization();
    await page.goto(`/organizations/${slug}`);
    const searchParams = new URLSearchParams();
    searchParams.append('redirectTo', `/organizations/${slug}/home`);
    expect(getPath(page)).toEqual(`/login?${searchParams.toString()}`);
  });

  test('given a logged in user who is NOT onboarded: redirects the user to the onboarding page', async ({
    page,
  }) => {
    const { slug } = createPopulatedOrganization();
    const user = await loginAndSaveUserProfileToDatabase({ name: '', page });

    await page.goto(`/organizations/${slug}`);
    expect(getPath(page)).toEqual('/onboarding/user-profile');

    await deleteUserProfileFromDatabaseById(user.id);
  });

  test('given a logged in user who is onboarded and a member of the organization with the given slug: redirects the user to the home page of the organization', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto(`/organizations/${organization.slug}`);
    expect(getPath(page)).toEqual(`/organizations/${organization.slug}/home`);

    await teardownOrganizationAndMember({ organization, user });
  });

  test('given a logged in user who is onboarded and NOT a member of the organization with the given slug: shows a 404 not found page', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });
    const otherOrganization = createPopulatedOrganization();
    await saveOrganizationToDatabase(otherOrganization);

    await page.goto(`/organizations/${otherOrganization.slug}`);

    expect(await page.title()).toEqual('404 | French House Stack');
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

    await teardownOrganizationAndMember({ organization, user });
    await deleteOrganizationFromDatabaseById(otherOrganization.id);
  });
});
