import 'dotenv/config';

import { expect, test } from '@playwright/test';

import { USER_AUTHENTICATION_SESSION_NAME } from '~/features/user-authentication/user-authentication-session.server';

import { loginByCookie } from '../../utils';

const loginLoaderRoute = '/login?_data=routes%2Flogin';
const invalidMagicEmail = 'test+fail@magic.link';
const validMagicEmail = 'test+success@magic.link';

test.describe('login page', () => {
  test('redirects to the route specified in the search parameter if the user is logged in', async ({
    page,
    baseURL,
  }) => {
    await loginByCookie({ page });
    // TODO: `/home` is the default. We should change this assertion to another
    // route.
    const searchParameters = new URLSearchParams({ redirectTo: '/home' });
    await page.goto('./login?' + searchParameters.toString());
    expect(page.url()).toEqual(baseURL + '/home');
  });

  test('lets the user log in with valid credentials', async ({
    page,
    baseURL,
  }) => {
    await page.addInitScript(() => {
      window.runMagicInTestMode = true;
    });
    await page.route(loginLoaderRoute, route => {
      return route.fulfill({
        headers: {
          'Set-Cookie': `${USER_AUTHENTICATION_SESSION_NAME}=${process.env.VALID_COOKIE_TOKEN}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax`,
          'X-Remix-Redirect': '/home',
          'X-Remix-Revalidate': 'yes',
        },
        status: 204,
      });
    });

    // Navigate to the login page.
    await page.goto('./login');

    // The page has the correct tile.
    expect(await page.title()).toEqual(
      'Sign In / Sign Up | French House Stack',
    );

    // Enter the valid email and submit the form.
    await page.getByLabel(/email/i).fill(validMagicEmail);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByRole('button', { name: /sign in/i }).isHidden();
    await page.getByRole('button', { name: /authenticating/i }).isDisabled();
    await page.waitForLoadState('networkidle');

    // After logging in, the user should be redirected to the home page.
    expect(page.url()).toEqual(baseURL + '/home');
  });

  test('fails gracefully with invalid credentials', async ({
    page,
    baseURL,
  }) => {
    // NOTE: This test has two `waits` to make the test more reliable.
    // The first wait waits for the page to load. The second wait waits for the
    // page to correctly navigate to the next page after the successful sign in.
    await page.addInitScript(() => {
      window.runMagicInTestMode = true;
    });
    await page.route(loginLoaderRoute, route => {
      return route.fulfill({
        headers: {
          'Set-Cookie': `${USER_AUTHENTICATION_SESSION_NAME}=${process.env.VALID_COOKIE_TOKEN}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax`,
          'X-Remix-Redirect': '/home',
          'X-Remix-Revalidate': 'yes',
        },
        status: 204,
      });
    });

    // Navigate to the login page.
    await page.goto('./login');

    // Enter a malformed email and submit the form.
    await page.getByLabel(/email/i).fill('not-an-email@foo');
    await page
      .getByText("A valid email consists of characters, '@' and '.'.")
      .isVisible();
    await page.getByRole('button', { name: /sign in/i }).isDisabled();

    // Enter no email at all.
    await page.getByLabel(/email/i).fill('');
    await page.getByText(/please enter a valid email/i).isVisible();
    await page.getByRole('button', { name: /sign in/i }).isDisabled();

    // Enter an invalid email and submit the form.
    await page.getByLabel(/email/i).fill(invalidMagicEmail);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForLoadState('networkidle');

    // There should be an appropriate error message.
    await page.getByText(/login failed. please try again/i).isVisible();

    // The error should NOT crash the app and the user should be able to log in
    // again with a valid email.
    await page.getByLabel(/email/i).fill(validMagicEmail);
    await page.getByRole('button', { name: /sign in/i }).isEnabled();
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(baseURL + '/home');
    await page.getByRole('heading', { level: 1, name: /home/i }).isVisible();
    expect(page.url()).toEqual(baseURL + '/home');
  });
});
