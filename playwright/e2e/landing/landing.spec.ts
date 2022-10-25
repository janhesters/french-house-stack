import { expect, test } from '@playwright/test';

import { loginByCookie } from '../../utils';

test.describe('landing page', () => {
  test('has the correct title and renders a greeting', async ({ page }) => {
    await page.goto('./');
    expect(await page.title()).toEqual('French House Stack');
    await page
      .getByRole('heading', { level: 1, name: 'French House Stack' })
      .isVisible();
  });

  test("redirects you to the home page when you're logged in", async ({
    page,
    baseURL,
  }) => {
    await loginByCookie({ page });
    await page.goto('./');
    expect(page.url()).toEqual(baseURL + '/home');
  });
});