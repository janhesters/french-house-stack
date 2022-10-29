import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { loginByCookie } from '../../utils';

test.describe('not found page', () => {
  test('the page renders the correct title and a useful error message and a link that redirects logged out users to the landig page instead', async ({
    page,
    baseURL,
  }) => {
    await page.goto('./some-non-existing-url');

    // It has the correct title and header.
    expect(await page.title()).toEqual('404 Not Found | French House Stack');
    await page
      .getByRole('heading', { name: /page not found/i, level: 1 })
      .isVisible();

    // It renders a link to contact support and a button to navigate to the
    // landing page.
    await page.getByRole('link', { name: /contact support/i }).isVisible();
    await page.getByRole('link', { name: /home/i }).click();
    expect(page.url()).toEqual(baseURL + '/');
  });

  test('the page renders a link that redirects logged in users to the home page', async ({
    page,
    baseURL,
  }) => {
    await loginByCookie({ page });
    await page.goto('./some-non-existing-url');

    // Clicking the home button navigates the user to the home page.
    await page.getByRole('link', { name: /home/i }).click();
    await page.waitForNavigation();
    await page.getByRole('heading', { name: /home/i, level: 1 }).isVisible();
    expect(page.url()).toEqual(baseURL + '/home');
  });

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('./some-non-existing-url');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
