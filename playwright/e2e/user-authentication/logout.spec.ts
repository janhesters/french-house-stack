import { expect, test } from '@playwright/test';

import { teardownOrganizationAndMember } from '~/test/test-utils';

import { setupOrganizationAndLoginAsMember } from '../../utils';

test.describe('logout', () => {
  test('given an onboarded user on a page where the sidebar is visible: lets the user log out', async ({
    page,
    browserName,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      browserName === 'webkit',
      'Safari (Desktop & Mobile) fails in CI. Locally it works ...',
    );

    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    // Navigate to a page with a sidebar, e.g. the organization's home page.
    await page.goto(`/organizations/${organization.slug}/home`);

    // Open the user menu.
    await page.getByRole('button', { name: /open user menu/i }).click();

    // Click the logout button.
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(
      page.getByRole('heading', { name: /french house stack/i, level: 1 }),
    ).toBeVisible();

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });
});
