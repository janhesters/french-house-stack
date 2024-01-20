import { describe, expect, test } from 'vitest';

import { ORGANIZATION_MEMBERSHIP_ROLES } from '~/features/organizations/organizations-constants';
import { deleteOrganizationFromDatabaseById } from '~/features/organizations/organizations-model.server';
import { retrieveUserProfileFromDatabaseById } from '~/features/user-profile/user-profile-model.server';
import {
  createAuthenticatedRequest,
  setupUserWithOrgAndAddAsMember,
  toFormData,
} from '~/test/test-utils';

import { action } from './settings.account';

const url = 'http://localhost:3000/settings/account';

const createBody = ({ intent = 'delete' } = {}) => ({ intent });

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

describe('/settings/account route action', () => {
  test('given an unauthenticated request: should throw a redirect response to the login page', async () => {
    expect.assertions(2);

    const request = new Request(url, { method: 'POST' });

    try {
      await action({ request, context: {}, params: {} });
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual(
          `/login?redirectTo=%2Fsettings%2Faccount`,
        );
      }
    }
  });

  describe('delete intent', () => {
    const intent = 'delete';

    test('given the user is NOT an owner for any organization: deletes the account, logs the user out and redirects to the landing page', async () => {
      const { organization, user } = await setupUserWithOrgAndAddAsMember();
      const body = createBody({ intent });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
      });

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual('/');
      expect(response.headers.get('Set-Cookie')).toEqual(
        '__user-authentication-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
      );

      const deletedUser = await retrieveUserProfileFromDatabaseById(user.id);
      expect(deletedUser).toEqual(null);

      await deleteOrganizationFromDatabaseById(organization.id);
    });

    test('given the user is an owner for at least one organization: returns a 400 bad request', async () => {
      const { organization, user } = await setupUserWithOrgAndAddAsMember({
        role: ORGANIZATION_MEMBERSHIP_ROLES.OWNER,
      });
      const body = createBody({ intent });

      const response = await sendAuthenticatedRequest({
        userId: user.id,
        formData: toFormData(body),
      });

      expect(response.status).toEqual(400);
      expect(await response.json()).toEqual({
        error: 'settings-account:still-an-owner',
        message: 'Bad Request',
      });

      const updatedUser = await retrieveUserProfileFromDatabaseById(user.id);
      expect(updatedUser?.name).toEqual(user.name);

      await deleteOrganizationFromDatabaseById(organization.id);
    });
  });
});
