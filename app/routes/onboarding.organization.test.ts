import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';
import { retrieveOrganizationWithMembersFromDatabaseBySlug } from '~/features/organizations/organizations-model.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import {
  createAuthenticatedRequest,
  setupUserWithOrgAndAddAsMember,
  teardownOrganizationAndMember,
} from '~/test/test-utils';
import { toFormData } from '~/utils/to-form-data';

import { action } from './onboarding.organization';

const url = 'http://localhost:3000/onboarding/organization';

const createBody = ({
  intent = 'create',
  name = createPopulatedOrganization().name,
} = {}) => ({ intent, name });

async function sendAuthenticatedRequest({
  userId,
  formData = toFormData(createBody()),
}: {
  userId: string;
  formData?: FormData;
}) {
  const request = await createAuthenticatedRequest({ url, userId, formData });
  return await action({ request, context: {}, params: {} });
}

async function setup() {
  const user = createPopulatedUserProfile();
  await saveUserProfileToDatabase(user);
  return { user };
}

describe('/onboarding/organization route action', () => {
  test('given an unauthenticated request: should throw a redirect response to the login page', async () => {
    expect.assertions(2);

    const request = new Request(url, { method: 'POST' });

    try {
      await action({ request, context: {}, params: {} });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual(
          '/login?redirectTo=%2Fonboarding%2Forganization',
        );
      }
    }
  });

  describe('create intent', () => {
    const intent = 'create';

    test("given a valid name for the organization: creates an organization with the name, adds the user as the owner and redirects to the organization's page", async () => {
      const { user } = await setup();
      const organization = createPopulatedOrganization();
      const body = createBody({ intent, name: organization.name });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
      });

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual(
        `/organizations/${organization.slug}`,
      );

      // It creates a new organization with the given name.
      const createdOrganization =
        await retrieveOrganizationWithMembersFromDatabaseBySlug(
          faker.helpers.slugify(body.name).toLowerCase(),
        );
      expect(createdOrganization).toMatchObject({
        name: body.name,
      });
      expect(createdOrganization!.memberships[0].member.id).toEqual(user.id);
      expect(createdOrganization!.memberships[0].role).toEqual(
        ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
      );

      await deleteUserProfileFromDatabaseById(user.id);
    });

    test.each([
      {
        name: faker.string.alpha({ length: 2 }),
        reason: "the organization's name is too short",
        expectedError: 'onboarding-organization:name-min-length',
      },
      {
        name: '   .   ',
        reason:
          'the name is technically long enough, but contains empty spaces',
        expectedError: 'onboarding-organization:name-min-length',
      },
      {
        name: faker.string.alpha({ length: 256 }),
        reason: "the organization's name is too long",
        expectedError: 'onboarding-organization:name-max-length',
      },
    ])(
      'given invalid form data, e.g. $reason: returns a 400',
      async ({ name, expectedError }) => {
        expect.assertions(2);

        const { user } = await setup();

        try {
          await sendAuthenticatedRequest({
            userId: user.id,
            formData: toFormData(createBody({ intent, name })),
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

        await deleteUserProfileFromDatabaseById(user.id);
      },
    );

    test('given a user who lacks a name but has organizations: redirects the user to the user profile onboarding page', async () => {
      expect.assertions(2);

      const { user, organization } = await setupUserWithOrgAndAddAsMember({
        user: createPopulatedUserProfile({ name: '' }),
      });
      const body = createBody({ intent });

      try {
        await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(body),
        });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(302);
          expect(error.headers.get('Location')).toEqual(
            '/onboarding/user-profile',
          );
        }
      }

      await teardownOrganizationAndMember({ user, organization });
    });

    test("given the user has a name and is a member of an organization: redirects the user to their first organization's page", async () => {
      expect.assertions(2);

      const { user, organization } = await setupUserWithOrgAndAddAsMember();

      try {
        await sendAuthenticatedRequest({
          userId: user.id,
          formData: toFormData(createBody({ intent })),
        });
      } catch (error) {
        if (error instanceof Response) {
          expect(error.status).toEqual(302);
          expect(error.headers.get('Location')).toEqual(
            `/organizations/${organization.slug}`,
          );
        }
      }

      await teardownOrganizationAndMember({ user, organization });
    });
  });
});
