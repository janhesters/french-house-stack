import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { loginByCookie } from '../../utils';

test.describe('home page', () => {
  test("page redirects you to the login page when you're logged out and remembers the page as the redirectTo query parameter", async ({
    page,
    baseURL,
  }) => {
    await page.goto('./home');
    const expectedUrl = new URL(baseURL + '/login');
    expectedUrl.searchParams.append('redirectTo', '/home');
    expect(page.url()).toEqual(expectedUrl.href);
  });

  // test('has the correct title and renders the user email when they are logged in and lets the user log out', async ({
  test("given the user is logged in: has the correct title, renders the user's email and lets the user log out", async ({
    page,
    baseURL,
    browserName,
  }) => {
    // See: https://github.com/microsoft/playwright/issues/18318
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      browserName === 'webkit',
      'webkit does not support redirects in route.fulfill',
    );

    // We stub the logout message to prevent Magic from logging out the test
    // user.
    // TODO: Refactor when Magic supports server side test mode.
    await page.route('/logout', async route => {
      await page.context().clearCookies();
      return route.fulfill({
        headers: { ...route.request().headers(), Location: '/' },
        status: 302,
      });
    });

    await loginByCookie({ page });
    await page.goto('./home');

    // The page has the correct tile.
    expect(await page.title()).toEqual('Home | French House Stack');

    // It retrieves the users data.
    await page.getByText('bob@french-house-stack.com').isVisible();

    // Logging the user out should redirect you to the landing page.
    await page.getByRole('button', { name: /open user menu/i }).click();
    await page.getByRole('menuitem', { name: /log out/i }).click();
    expect(page.url()).toEqual(baseURL + '/');

    // Verify that the user is really logged out by trying to visit the home
    // page and getting redirected to login.
    await page.goto('./home');
    expect(page.url()).toContain('/login');
  });

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await loginByCookie({ page });
    await page.goto('./home');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
