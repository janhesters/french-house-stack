import 'dotenv/config';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { UserProfile } from '@prisma/client';

import { createPopulatedUserAuthSession } from '~/features/user-authentication/user-auth-session-factories.server';
import { saveUserAuthSessionToDatabase } from '~/features/user-authentication/user-auth-session-model.server';
import { USER_AUTHENTICATION_SESSION_NAME } from '~/features/user-authentication/user-authentication-session.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';

import {
  createValidCookieToken,
  getPath,
  setupOrganizationAndLoginAsMember,
} from '../../utils';

const loginLoaderRoute = '/login.data';
const invalidMagicEmail = 'test+fail@magic.link';
const validMagicEmail = 'test+success@magic.link';

test.describe('login page', () => {
  test("given an onboarded user: redirects to the user's first organization's home page", async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });

    await page.goto('/login');
    expect(getPath(page)).toEqual(`/organizations/${organization.slug}/home`);

    await page.close();
    await teardownOrganizationAndMember({ organization, user });
  });

  test.describe('login with setup', () => {
    // Because this test is flaky, we're going to do the setup and teardown in
    // before each and after each hooks.
    let user: UserProfile;
    let failingUser: UserProfile;

    test.beforeEach(async () => {
      user = createPopulatedUserProfile({ email: validMagicEmail });
      await saveUserProfileToDatabase(user);
      failingUser = createPopulatedUserProfile({ email: invalidMagicEmail });
      await saveUserProfileToDatabase(failingUser);
    });

    test.afterEach(async () => {
      await deleteUserProfileFromDatabaseById(user.id);
      await deleteUserProfileFromDatabaseById(failingUser.id);
    });

    test('given a logged out user and entering valid credentials, but with an error in Magic: fails gracefully', async ({
      page,
      browserName,
    }) => {
      // eslint-disable-next-line playwright/no-skipped-test
      test.skip(
        browserName === 'webkit',
        'Safari (Desktop & Mobile) fails in CI.',
      );

      const userAuthSession = createPopulatedUserAuthSession({
        userId: user.id,
      });
      await saveUserAuthSessionToDatabase(userAuthSession);
      const cookieToken = await createValidCookieToken(userAuthSession.id);

      await page.addInitScript(() => {
        window.runMagicInTestMode = true;
      });
      await page.route(loginLoaderRoute, (route, request) => {
        const postData = request.postData();

        if (postData && postData.includes('didToken')) {
          return route.fulfill({
            body: JSON.stringify([
              { _1: 2, _3: 4, _5: 6, _7: 8, _9: 8 },
              'redirect',
              '/onboarding',
              'status',
              302,
              'revalidate',
              true,
              'reload',
              false,
              'replace',
            ]),
            headers: {
              'Set-Cookie': `${USER_AUTHENTICATION_SESSION_NAME}=${cookieToken}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax`,
              'Transfer-Encoding': 'chunked',
              'x-remix-response': 'yes',
              'content-type': 'text/x-script',
              Location: '/onboarding',
            },
            status: 204,
          });
        }

        return route.continue();
      });

      // Navigate to the login page.
      await page.goto('/login');

      // The page has the correct title.
      expect(await page.title()).toEqual('Login | French House Stack');

      // Enter an invalid email and submit the form.
      await page.getByLabel(/email/i).fill(invalidMagicEmail);
      await page.getByRole('button', { name: /login/i }).click();

      // There should be an appropriate error message.
      await expect(
        page.getByText(/login failed. please try again/i),
      ).toBeVisible();

      // Enter the valid email and submit the form.
      await page.getByLabel(/email/i).fill(validMagicEmail);
      await page.getByRole('button', { name: /login/i }).click();
      await page.getByRole('button', { name: /authenticating/i }).isDisabled();

      // After logging in, the user should be redirected to the onboarding page.
      await page.waitForURL('/onboarding/organization');
      expect(getPath(page)).toEqual('/onboarding/organization');

      await page.context().close();
    });
  });

  test('given a logged out user and entering invalid data: shows the correct error messages', async ({
    page,
  }) => {
    await page.goto('/login');

    // The user can fill in the form with invalid data and submit it.
    const loginButton = page.getByRole('button', { name: /login/i });
    await loginButton.click();

    // The email input shows the correct error messages.
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();

    // Invalid email.
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('invalid email');
    await loginButton.click();
    await expect(
      page.getByText(/a valid email consists of characters, '@' and '.'./i),
    ).toBeVisible();

    // User does not exist.
    await emailInput.fill(createPopulatedUserProfile().email);
    await loginButton.click();
    await expect(
      page.getByText(
        /user with given email doesn't exist. did you mean to create a new account instead?/i,
      ),
    ).toBeVisible();

    // The register button has the correct link.
    await expect(
      page.getByRole('link', { name: /create your account/i }),
    ).toHaveAttribute('href', '/register');
  });

  test('given a logged out user and an invite link token in the url: changes the register redirect button to also include the token', async ({
    page,
  }) => {
    // Navigate to the login page with a token.
    await page.goto(`/login?token=1234`);

    // The register button has the correct link.
    await expect(
      page.getByRole('link', { name: /create your account/i }),
    ).toHaveAttribute('href', '/register?token=1234');
  });

  test('page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
