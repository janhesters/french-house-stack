import AxeBuilder from '@axe-core/playwright';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import type { Organization, UserProfile } from '@prisma/client';

import type { OrganizationMembershipRole } from '~/features/organizations/organizations-constants';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';
import {
  addMembersToOrganizationInDatabaseById,
  retrieveOrganizationMembershipFromDatabaseByUserIdAndOrganizationId,
  saveOrganizationToDatabase,
  updatedMembershipInDatabaseByUserIdAndOrganizationId,
} from '~/features/organizations/organizations-model.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import { teardownOrganizationAndMember } from '~/test/test-utils';
import { asyncForEach } from '~/utils/async-for-each.server';

import { getPath, setupOrganizationAndLoginAsMember } from '../../utils';

async function setup({
  numberOfOtherTeamMembers = faker.number.int({ min: 1, max: 9 }),
  page,
  role = ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
}: {
  numberOfOtherTeamMembers?: number;
  page: Page;
  role?: OrganizationMembershipRole;
}) {
  const { organization, user } = await setupOrganizationAndLoginAsMember({
    page,
    role,
  });
  const otherUsers = await Promise.all(
    faker.helpers
      .uniqueArray(
        () => createPopulatedUserProfile().email,
        numberOfOtherTeamMembers,
      )
      .map(email => createPopulatedUserProfile({ email }))
      .map(saveUserProfileToDatabase),
  );
  await asyncForEach(otherUsers, async otherUser => {
    await addMembersToOrganizationInDatabaseById({
      id: organization.id,
      members: [otherUser.id],
    });
  });
  const sortedUsers = [...otherUsers, user].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  return { organization, sortedUsers, user };
}

async function teardown({
  organization,
  sortedUsers,
  user,
}: {
  organization: Organization;
  sortedUsers: UserProfile[];
  user: UserProfile;
}) {
  await asyncForEach(sortedUsers, async otherUser => {
    if (otherUser.id !== user.id) {
      await deleteUserProfileFromDatabaseById(otherUser.id);
    }
  });
  await teardownOrganizationAndMember({ organization, user });
}

test.describe('organizations settings team members page', () => {
  test('given a logged out user: redirects the user to the login page', async ({
    page,
  }) => {
    const { slug } = createPopulatedOrganization();
    await page.goto(`/organizations/${slug}/settings/team-members`);
    const searchParams = new URLSearchParams();
    searchParams.append(
      'redirectTo',
      `/organizations/${slug}/settings/team-members`,
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

    await page.goto(
      `/organizations/${organization.slug}/settings/team-members`,
    );
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
    await page.goto(
      `/organizations/${otherOrganization.slug}/settings/team-members`,
    );

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

  test('given any type of onboarder user: shows the correct title, headings and links', async ({
    page,
    isMobile,
  }) => {
    const data = await setup({
      page,
      role: faker.helpers.arrayElement(
        Object.values(ORGANIZATION_MEMBERSHIP_ROLES),
      ),
    });
    const { organization } = data;

    await page.goto(
      `/organizations/${organization.slug}/settings/team-members`,
    );

    // The page has the correct title.
    expect(await page.title()).toMatch(/team members/i);

    // It should show the correct headings.
    await expect(
      page.getByRole('heading', { name: /organization settings/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /team members/i, level: 2 }),
    ).toBeVisible();

    // The page has the correct sidebar links.
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (isMobile) {
      // On mobile, open the burger menu.
      await page.getByRole('button', { name: /open sidebar/i }).click();
    }

    const sidebarNav = page.getByRole('navigation', { name: /sidebar/i });
    await expect(
      sidebarNav.getByRole('link', { name: /home/i }),
    ).toHaveAttribute('href', `/organizations/${organization.slug}/home`);
    await expect(
      sidebarNav.getByRole('link', { name: /settings/i }),
    ).toHaveAttribute('href', `/organizations/${organization.slug}/settings`);

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (isMobile) {
      // On mobile, close the burger menu.
      await page.getByRole('button', { name: /close sidebar/i }).click();
    }

    // The page has the correct user navigation links (open & close click).
    await page.getByRole('button', { name: /open user menu/i }).click();
    await expect(
      page.getByRole('link', { name: /your settings/i }),
    ).toHaveAttribute('href', '/settings');
    await expect(
      page.getByRole('menuitem', { name: /log out/i }),
    ).toBeVisible();
    await page.keyboard.press('Escape');

    // The page shows a nav bar.
    const navBar = page.getByRole('navigation', {
      name: /settings navigation/i,
    });
    await expect(
      navBar.getByRole('link', { name: /general/i }),
    ).toHaveAttribute(
      'href',
      `/organizations/${organization.slug}/settings/profile`,
    );
    await expect(
      navBar.getByRole('link', { name: /team members/i }),
    ).toHaveAttribute(
      'href',
      `/organizations/${organization.slug}/settings/team-members`,
    );

    await teardown(data);
  });

  test('given an onboarded member or admin user: shows the members of the organization, and hides the invite link creation UI', async ({
    page,
  }) => {
    const data = await setup({
      page,
      role: faker.helpers.arrayElement([
        ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
        ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
      ]),
    });
    const { organization, sortedUsers } = data;

    await page.goto(
      `/organizations/${organization.slug}/settings/team-members`,
    );

    // It renders the list of members.
    await expect(
      page.getByRole('heading', { name: /members/i, level: 3 }),
    ).toBeVisible();
    const memberListItems = page
      .getByRole('list', { name: /team members/i })
      .getByRole('listitem');
    const memberListItemsCount = await memberListItems.count();
    expect(memberListItemsCount).toEqual(sortedUsers.length);

    for (let index = 0; index < memberListItemsCount; index++) {
      const otherUser = sortedUsers[index];
      const memberListItem = memberListItems.nth(index);
      await expect(memberListItem.getByText(otherUser.name)).toBeVisible();
      await expect(memberListItem.getByText(otherUser.email)).toBeVisible();
      await expect(memberListItem.getByText(/member/i)).toBeVisible();
    }

    // It hides the invite link creation UI.
    await expect(
      page.getByRole('heading', { name: /invite team members/i, level: 3 }),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: /new invite link/i }),
    ).toBeHidden();

    await teardown(data);
  });

  test('given an onboarded owner user: shows the invite link creation UI as well as the members of the organization, and lets the user change their role', async ({
    page,
    browserName,
  }) => {
    // We need to ask for permission on Chromium to read the clipboard.
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (browserName === 'chromium') {
      await page.context().grantPermissions(['clipboard-read']);
    }

    const allRoles = Object.values(ORGANIZATION_MEMBERSHIP_ROLES);
    // Returns every assignable option for the roles dropdown.
    function* roleGenerator() {
      for (const role of allRoles) {
        yield role;
      }
    }
    const roleIterator = roleGenerator();
    const data = await setup({
      page,
      role: ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
      // Generate as many other users as there are roles. This is important
      // for the loop that assigns roles to the users using the iterator.
      numberOfOtherTeamMembers: allRoles.length,
    });
    const { organization, sortedUsers, user } = data;

    await page.goto(
      `/organizations/${organization.slug}/settings/team-members`,
    );

    // It renders the list of members.
    await expect(
      page.getByRole('heading', { name: /^members$/i, level: 3 }),
    ).toBeVisible();
    const memberListItems = page
      .getByRole('list', { name: /team members/i })
      .getByRole('listitem');
    const memberListItemsCount = await memberListItems.count();
    expect(memberListItemsCount).toEqual(sortedUsers.length);

    for (let index = 0; index < memberListItemsCount; index++) {
      const otherUser = sortedUsers[index];
      const memberListItem = memberListItems.nth(index);

      await expect(memberListItem.getByText(otherUser.name)).toBeVisible();
      await expect(memberListItem.getByText(otherUser.email)).toBeVisible();

      const isCurrentUser = otherUser.id === user.id;

      // eslint-disable-next-line playwright/no-conditional-in-test
      if (isCurrentUser) {
        // It prevents the owner user from changing their own role.
        await expect(memberListItem.getByText(/owner/i)).toBeVisible();
        await expect(
          memberListItem.getByRole('button', { name: /owner/i }),
        ).toBeHidden();
      } else {
        // It lets the owner user change the role of the other users.
        await memberListItem.getByRole('button', { name: /member/i }).click();
        const role = roleIterator.next().value!;
        await page
          .getByRole('option', { name: role })
          .getByRole('button')
          .click();
        await page.keyboard.press('Escape');
        const membership =
          await retrieveOrganizationMembershipFromDatabaseByUserIdAndOrganizationId(
            {
              organizationId: organization.id,
              userId: otherUser.id,
            },
          );
        expect(membership!.role).toEqual(role);
      }
    }

    // It lets the owner deactivate a user, but they should keep their role.
    const index = sortedUsers.findIndex(otherUser => otherUser.id !== user.id)!;
    const memberListItem = memberListItems.nth(index);
    const otherUser = sortedUsers[index];
    await memberListItem.getByRole('button', { name: /member/i }).click();
    await page
      .getByRole('option', { name: /deactivate/i })
      .first()
      .getByRole('button')
      .click();
    await page.keyboard.press('Escape');
    const membership =
      await retrieveOrganizationMembershipFromDatabaseByUserIdAndOrganizationId(
        {
          organizationId: organization.id,
          userId: otherUser.id,
        },
      );
    expect(membership!.role).toEqual(ORGANIZATION_MEMBERSHIP_ROLES.MEMBER);
    expect(membership!.deactivatedAt).not.toBeNull();

    // Page lets the user generate a new invite link.
    await expect(
      page.getByRole('heading', { name: /invite team members/i }),
    ).toBeVisible();
    await page.getByRole('button', { name: /create new invite link/i }).click();
    await expect(
      page.getByRole('link', {
        name: /go to the invite link's page/i,
      }),
    ).toBeVisible();

    // It lets the user generate a new link.
    const oldLink = await page
      .getByRole('link', { name: /go to the invite link's page/i })
      .getAttribute('href');
    await page.getByRole('button', { name: /regenerate link/i }).click();
    expect(
      page
        .getByRole('link', { name: /go to the invite link's page/i })
        .getAttribute('href'),
    ).not.toEqual(oldLink);

    // It renders a button to copy the link to the event.
    await page
      .getByRole('button', { name: /copy invite link to clipboard/i })
      .click();
    await expect(
      page.getByRole('button', { name: /invite link copied to clipboard/i }),
    ).toBeVisible();
    // Firefox only supports the clipboard API, if you run a secure context.
    // I couldn't figure out how to run localhost on HTTPS, so I'm skipping
    // this test for Firefox for now.
    // And Safari doesn't work either, for some reason.
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (browserName === 'chromium') {
      const copiedText: string = await page.evaluate(
        'navigator.clipboard.readText()',
      );
      expect(copiedText).toContain(`/organizations/invite?token=`);
    }

    // It renders a button to deactivate the link.
    await page.getByRole('button', { name: /deactivate link/i }).click();
    await expect(
      page.getByRole('button', { name: /regenerate link/i }),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: /deactivate link/i }),
    ).toBeHidden();
    await expect(
      page.getByRole('link', {
        name: /go to the invite link's page/i,
      }),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: /create new invite link/i }),
    ).toBeVisible();

    await teardown(data);
  });

  test('given an onboarded user and less than 10 members: hides the previous and next pagination buttons', async ({
    page,
  }) => {
    const data = await setup({
      page,
      role: faker.helpers.arrayElement([
        ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
        ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
        ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
      ]),
    });

    await page.goto(
      `/organizations/${data.organization.slug}/settings/team-members`,
    );

    // It hides the pagination buttons.
    await expect(page.getByRole('link', { name: /previous/i })).toBeHidden();
    await expect(page.getByRole('link', { name: /next/i })).toBeHidden();

    await teardown(data);
  });

  test('given a member that has been deactivated: redirects to the onboarding organization page', async ({
    page,
  }) => {
    const { organization, user } = await setupOrganizationAndLoginAsMember({
      page,
    });
    await updatedMembershipInDatabaseByUserIdAndOrganizationId({
      membership: { deactivatedAt: new Date() },
      organizationId: organization.id,
      userId: user.id,
    });

    // Try to visit the team members page of the organization.
    await page.goto(
      `/organizations/${organization.slug}/settings/team-members`,
    );
    expect(getPath(page)).toEqual('/onboarding/organization');

    await teardownOrganizationAndMember({ organization, user });
  });

  test('given an onboarded owner user: page should lack any automatically detectable accessibility issues', async ({
    page,
  }) => {
    const data = await setup({
      page,
      role: ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
    });

    await page.goto(
      `/organizations/${data.organization.slug}/settings/team-members`,
    );
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    await page.close();
    await teardown(data);
  });
});
