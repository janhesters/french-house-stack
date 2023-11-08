import 'dotenv/config';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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

const loginLoaderRoute = '/login?_data=routes%2Flogin';
const invalidMagicEmail = 'test+fail@magic.link';
const validMagicEmail = 'test+success@magic.link';

test.describe('login page', () => {
  test("given a logged in user that is onboarded: redirects to the user's first organization's home page", async ({
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

  test('given a logged out user and entering valid credentials, but with an error in Magic: fails gracefully', async ({
    page,
    browserName,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      browserName === 'webkit',
      'Safari (Desktop & Mobile) fails in CI. Locally it works ...',
    );

    const user = createPopulatedUserProfile({ email: validMagicEmail });
    await saveUserProfileToDatabase(user);
    const userAuthSession = createPopulatedUserAuthSession({ userId: user.id });
    await saveUserAuthSessionToDatabase(userAuthSession);
    const cookieToken = await createValidCookieToken(userAuthSession.id);
    const failingUser = createPopulatedUserProfile({
      email: invalidMagicEmail,
    });
    await saveUserProfileToDatabase(failingUser);

    await page.addInitScript(() => {
      window.runMagicInTestMode = true;
    });
    await page.route(loginLoaderRoute, (route, request) => {
      const postData = request.postData();

      if (postData && postData.includes('didToken')) {
        return route.fulfill({
          headers: {
            'Set-Cookie': `${USER_AUTHENTICATION_SESSION_NAME}=${cookieToken}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax`,
            'X-Remix-Redirect': '/onboarding',
            'X-Remix-Revalidate': 'yes',
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
    await deleteUserProfileFromDatabaseById(user.id);
    await deleteUserProfileFromDatabaseById(failingUser.id);
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
