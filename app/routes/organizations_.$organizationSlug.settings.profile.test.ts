import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import type { OrganizationMembershipRole } from '~/features/organizations/organizations-constants';
import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server.js';
import {
  addMembersToOrganizationInDatabaseById,
  deleteOrganizationFromDatabaseById,
  retrieveOrganizationFromDatabaseById,
  saveOrganizationToDatabase,
} from '~/features/organizations/organizations-model.server';
import { deleteUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';
import {
  createAuthenticatedRequest,
  setupUserWithOrgAndAddAsMember,
  teardownOrganizationAndMember,
  toFormData,
} from '~/test/test-utils';
import { getToast } from '~/utils/toast.server';

import { action } from './organizations_.$organizationSlug.settings.profile';

const createUrl = (organizationSlug: string) =>
  `http://localhost:3000/organizations/${organizationSlug}/settings/profile`;

type BodyProps = {
  intent?: string;
  [key: string]: any;
};

const createBody = ({ intent = 'update', ...rest }: BodyProps = {}) => ({
  intent,
  ...rest,
});

async function sendAuthenticatedRequest({
  userId,
  formData = toFormData(createBody()),
  organizationSlug,
}: {
  userId: string;
  formData?: FormData;
  organizationSlug: string;
}) {
  const url = createUrl(organizationSlug);
  const request = await createAuthenticatedRequest({ url, userId, formData });
  const params = { organizationSlug };

  return await action({ request, context: {}, params });
}

function setup(
  role: OrganizationMembershipRole = ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
) {
  return setupUserWithOrgAndAddAsMember({ role });
}

describe('/organizations/:organizationSlug/settings/profile route action', () => {
  test('given an unauthenticated requests: should throw a redirect response to the login page', async () => {
    expect.assertions(2);

    const { slug } = createPopulatedOrganization();
    const request = new Request(createUrl(slug), { method: 'POST' });
    try {
      await action({ request, context: {}, params: {} });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual(
          `/login?redirectTo=%2Forganizations%2F${slug}%2Fsettings%2Fprofile`,
        );
      }
    }
  });

  test('given the organization does NOT exist: throws a 404', async () => {
    expect.assertions(1);

    const { organization, user } = await setup();
    const organizationSlug = faker.lorem.slug();

    try {
      await sendAuthenticatedRequest({
        userId: user.id,
        organizationSlug,
      });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(404);
      }
    }

    await teardownOrganizationAndMember({ user, organization });
  });

  test('given the user is NOT a member of the organization: throws a 404', async () => {
    expect.assertions(1);

    const { user, organization } = await setup();
    const otherOrganization = createPopulatedOrganization();
    await saveOrganizationToDatabase(otherOrganization);

    try {
      await sendAuthenticatedRequest({
        userId: user.id,
        organizationSlug: otherOrganization.slug,
      });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(404);
      }
    }

    await deleteOrganizationFromDatabaseById(otherOrganization.id);
    await teardownOrganizationAndMember({ user, organization });
  });

  test('given invalid form data (invalid intent): throws a 400 with a "invalid-intent" error', async () => {
    expect.assertions(1);

    const { user, organization } = await setup();
    const body = createBody({ intent: 'invalid' });

    try {
      await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
        organizationSlug: organization.slug,
      });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(400);
      }
    }

    await teardownOrganizationAndMember({ user, organization });
  });

  describe('update intent', () => {
    const intent = 'update';

    test.each([
      {
        name: faker.string.alpha({ length: 2 }),
        reason: "the organization's name is too short",
        expectedError: 'organization-profile:name-min-length',
      },
      {
        name: '   .   ',
        reason:
          'the name is technically long enough, but contains empty spaces',
        expectedError: 'organization-profile:name-min-length',
      },
      {
        name: faker.string.alpha({ length: 256 }),
        reason: "the organization's name is too long",
        expectedError: 'organization-profile:name-max-length',
      },
    ])(
      'given invalid form data, e.g. $reason: returns a 400',
      async ({ name, expectedError }) => {
        expect.assertions(2);

        const { organization, user } = await setup();

        try {
          await sendAuthenticatedRequest({
            userId: user.id,
            formData: toFormData(createBody({ intent, name })),
            organizationSlug: organization.slug,
          });
        } catch (error) {
          if (error instanceof Response) {
            expect(error.status).toEqual(400);
            expect(await error.json()).toEqual({
              errors: { name: { message: expectedError, type: 'manual' } },
              message: 'Bad Request',
            });
          }
        }

        await teardownOrganizationAndMember({ user, organization });
      },
    );

    test('given the user is only a member of the organization: throws a 403', async () => {
      expect.assertions(1);

      const { user, organization } = await setup();
      const body = createBody({
        intent,
        name: createPopulatedOrganization().name,
      });

      try {
        await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(body),
          organizationSlug: organization.slug,
        });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(403);
        }
      }

      await teardownOrganizationAndMember({ user, organization });
    });

    test.each([
      ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
      ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
    ])(
      'given valid data and the user is an %s of the organization: updates the name of the organization and shows a toast',
      async role => {
        const { organization, user } = await setup(role);
        const { name } = createPopulatedOrganization();
        const newSlug = faker.helpers.slugify(name).toLowerCase();
        const body = createBody({ intent, name });

        const response = await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(body),
          organizationSlug: organization.slug,
        });

        expect(response.status).toEqual(302);
        expect(response.headers.get('Location')).toEqual(
          `/organizations/${newSlug}/settings/profile`,
        );

        // It updates the organization in the database.
        const updatedOrganization = await retrieveOrganizationFromDatabaseById(
          organization.id,
        );
        expect(updatedOrganization?.name).toEqual(name);
        expect(updatedOrganization?.slug).toEqual(newSlug);

        // It shows a toast.
        const maybeHeaders = response.headers.get('Set-Cookie');
        const { toast } = await getToast(
          new Request(faker.internet.url(), {
            headers: { cookie: maybeHeaders ?? '' },
          }),
        );
        expect(toast).toMatchObject({
          id: expect.any(String),
          title: 'Organization has been updated',
          type: 'message',
        });

        await teardownOrganizationAndMember({ user, organization });
      },
    );
  });

  describe('delete intent', () => {
    const intent = 'delete';

    test.each([
      ORGANIZATION_MEMBERSHIP_ROLES.MEMBER,
      ORGANIZATION_MEMBERSHIP_ROLES.ADMIN,
    ])(
      'given the user is only a %s of the organization: throws a 403',
      async role => {
        expect.assertions(1);

        const { user, organization } = await setup(role);
        const body = createBody({ intent });

        try {
          await sendAuthenticatedRequest({
            userId: user.id,
            formData: toFormData(body),
            organizationSlug: organization.slug,
          });
        } catch (error) {
          if (error instanceof Response) {
            expect(error.status).toEqual(403);
          }
        }

        await teardownOrganizationAndMember({ user, organization });
      },
    );

    test("given the user is an onwer of the given organization and its the user's only organization: deletes the organization, redirects the user to the organization onboarding page and shows a toast", async () => {
      const { organization, user } = await setup(
        ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
      );
      const body = createBody({ intent });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
        organizationSlug: organization.slug,
      });

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual(
        `/onboarding/organization`,
      );

      // It deletes the organization from the database.
      const maybeOrganization = await retrieveOrganizationFromDatabaseById(
        organization.id,
      );
      expect(maybeOrganization).toEqual(null);

      // It shows a toast.
      const maybeHeaders = response.headers.get('Set-Cookie');
      const { toast } = await getToast(
        new Request(faker.internet.url(), {
          headers: { cookie: maybeHeaders ?? '' },
        }),
      );
      expect(toast).toMatchObject({
        id: expect.any(String),
        title: 'Organization has been deleted',
        type: 'message',
      });

      await deleteUserProfileFromDatabaseById(user.id);
    });

    test("given the user is an onwer of the given organization and they're a member of other organizations: deletes the organization, redirects the user to their first organization's page and shows a toast", async () => {
      const { organization, user } = await setup();
      const otherOrganization = createPopulatedOrganization();
      await saveOrganizationToDatabase(otherOrganization);
      await addMembersToOrganizationInDatabaseById({
        id: otherOrganization.id,
        members: [user.id],
        role: ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
      });
      const body = createBody({ intent });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
        organizationSlug: otherOrganization.slug,
      });

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual(
        `/organizations/${organization.slug}/home`,
      );

      // It deletes the organization from the database.
      const maybeOrganization = await retrieveOrganizationFromDatabaseById(
        otherOrganization.id,
      );
      expect(maybeOrganization).toEqual(null);

      // It shows a toast.
      const maybeHeaders = response.headers.get('Set-Cookie');
      const { toast } = await getToast(
        new Request(faker.internet.url(), {
          headers: { cookie: maybeHeaders ?? '' },
        }),
      );
      expect(toast).toMatchObject({
        id: expect.any(String),
        title: 'Organization has been deleted',
        type: 'message',
      });

      await deleteUserProfileFromDatabaseById(user.id);
    });
  });
});
