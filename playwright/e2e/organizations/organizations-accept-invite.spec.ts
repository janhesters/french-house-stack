import AxeBuilder from '@axe-core/playwright';
import { createId } from '@paralleldrive/cuid2';
import { expect, test } from '@playwright/test';

import { createPopulatedOrganizationInviteLink } from '~/features/organizations/organizations-factories.server';
import { saveOrganizationInviteLinkToDatabase } from '~/features/organizations/organizations-invite-link-model.server';
import { saveUserAuthSessionToDatabase } from '~/features/user-authentication/user-auth-session-model.server';
import {
  setupUserWithOrgAndAddAsMember,
  teardownOrganizationAndMember,
} from '~/test/test-utils';

import {
  getPath,
  loginByCookie,
  ONE_YEAR_IN_MILLISECONDS,
  setupOrganizationAndLoginAsMember,
} from '../../utils';

async function setup() {
  const { organization, user } = await setupUserWithOrgAndAddAsMember();
  const inviteLink = createPopulatedOrganizationInviteLink({
    creatorId: user.id,
    organizationId: organization.id,
  });
  await saveOrganizationInviteLinkToDatabase(inviteLink);
  return { inviteLink, organization, user };
}

test.describe('accept invite page', () => {
  test.describe('given an anonymous user', () => {
    test('given a valid invite token: clicking the accept invite button should redirect to the register page and show a toast that the link is valid', async ({
      page,
      browserName,
    }) => {
      // eslint-disable-next-line playwright/no-skipped-test
      test.skip(
        browserName === 'webkit',
        'Safari (Desktop & Mobile) fails in CI.',
      );
      const data = await setup();

      await page.goto(`/organizations/invite?token=${data.inviteLink.token}`);

      // Clicking the invite link redirects to the register page and shows a
      // toast that the link is valid.
      await page.getByRole('button', { name: /accept invite/i }).click();
      await expect(
        page.getByRole('heading', { name: /create your account/i }),
      ).toBeVisible();
      await expect(page.getByRole('status')).toHaveText(
        /invitation link is valid/i,
      );

      await teardownOrganizationAndMember(data);
    });

    test('given an invalid invite token: shows a 404 page', async ({
      page,
    }) => {
      await page.goto('/organizations/invite?token=invalid-token');

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
    });

    test('page should lack any automatically detectable accessibility issues', async ({
      page,
    }) => {
      await page.goto(`/organizations/invite`);
      const accessibilityScanResults = await new AxeBuilder({ page })
        .disableRules('color-contrast')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('given an authenticated user', () => {
    test("given a valid invite token for an organization that the user is NOT a member of: clicking the accept invite button should redirect to organization's home page and show a toast that the invite was successful", async ({
      page,
      browserName,
    }) => {
      // eslint-disable-next-line playwright/no-skipped-test
      test.skip(
        browserName === 'webkit',
        'Safari (Desktop & Mobile) fails in CI.',
      );
      const data = await setup();
      const otherData = await setupOrganizationAndLoginAsMember({ page });

      await page.goto(`/organizations/invite?token=${data.inviteLink.token}`);

      // Clicking the invite link redirects to the organization's page and
      // shows a toast that the invite was successful.
      await page.getByRole('button', { name: /accept invite/i }).click();
      await expect(page.getByRole('heading', { name: /home/i })).toBeVisible();
      expect(getPath(page)).toEqual(
        `/organizations/${data.organization.slug}/home`,
      );
      await expect(page.getByRole('status')).toHaveText(
        /successfully joined organization/i,
      );

      await teardownOrganizationAndMember(data);
      await teardownOrganizationAndMember(otherData);
    });

    test('given an invalid invite token: shows a 404 page', async ({
      page,
    }) => {
      const data = await setupOrganizationAndLoginAsMember({ page });

      await page.goto('/organizations/invite?token=invalid-token');

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

      await teardownOrganizationAndMember(data);
    });

    test("given an invite link token for an organization that the user is already a member of: redirects to the organization's home page and shows a toast that they're already a member", async ({
      page,
      browserName,
    }) => {
      // eslint-disable-next-line playwright/no-skipped-test
      test.skip(
        browserName === 'webkit',
        'Safari (Desktop & Mobile) fails in CI.',
      );
      const data = await setup();
      const { id: userAuthSessionId } = await saveUserAuthSessionToDatabase({
        expirationDate: new Date(Date.now() + ONE_YEAR_IN_MILLISECONDS),
        id: createId(),
        userId: data.user.id,
      });
      await loginByCookie({ page, userAuthSessionId });

      await page.goto(`/organizations/invite?token=${data.inviteLink.token}`);

      // Clicking the invite link redirects to the organization's page and
      // shows a toast that the invite was successful.
      await page.getByRole('button', { name: /accept invite/i }).click();
      await expect(page.getByRole('heading', { name: /home/i })).toBeVisible();
      expect(getPath(page)).toEqual(
        `/organizations/${data.organization.slug}/home`,
      );
      await expect(page.getByRole('status')).toHaveText(/already a member/i);

      await teardownOrganizationAndMember(data);
    });

    test('page should lack any automatically detectable accessibility issues', async ({
      page,
    }) => {
      const data = await setupOrganizationAndLoginAsMember({ page });

      await page.goto(`/organizations/invite`);
      const accessibilityScanResults = await new AxeBuilder({ page })
        .disableRules('color-contrast')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);

      await page.close();
      await teardownOrganizationAndMember(data);
    });
  });
});
