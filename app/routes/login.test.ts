// @vitest-environment node
import { faker } from '@faker-js/faker';
import { describe, expect, test, vi } from 'vitest';

import { magicAdmin } from '~/features/user-authentication/magic-admin.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import { generateRandomDid } from '~/test/generate-random-did.server';

import { action } from './login';

describe('login page action', async () => {
  test('given a login intent with an email: returns a response with a body containing the email', async () => {
    const formData = new FormData();
    formData.set('_intent', 'login');
    const email = faker.internet.email();
    formData.set('email', email);
    const request = new Request('http://localhost:3000/login', {
      method: 'POST',
      body: formData,
    });

    const response = await action({ request, context: {}, params: {} });

    expect(await response.json()).toEqual({ email });
  });

  test('a magic intent with a DID toke: redirects the user home and attaches an authentication cookie to the request', async () => {
    const userProfile = createPopulatedUserProfile();
    await saveUserProfileToDatabase(userProfile);

    vi.spyOn(magicAdmin.users, 'getMetadataByToken').mockResolvedValue({
      email: userProfile.email,
      issuer: userProfile.id,
      phoneNumber: faker.phone.number(),
      publicAddress: faker.finance.ethereumAddress(),
      oauthProvider: faker.internet.domainName(),
      wallets: [],
    });

    const formData = new FormData();
    formData.set('_intent', 'magic');
    const didToken = generateRandomDid();
    formData.set('didToken', didToken);
    const request = new Request('http://localhost:3000/login', {
      method: 'POST',
      body: formData,
    });

    const response = await action({ request, context: {}, params: {} });

    expect(response.status).toEqual(302);
    expect(response.headers.get('location')).toEqual('/home');
    expect(
      response.headers
        .get('set-cookie')
        ?.includes('__user-authentication-session=ey'),
    ).toEqual(true);

    await deleteUserProfileFromDatabaseById(userProfile.id);
  });

  test('a magic error intent with formError values: returns a response with a 400 status code and a body containing the formError', async () => {
    const formData = new FormData();
    formData.set('_intent', 'magicError');
    const formError = faker.lorem.sentence();
    formData.set('formError', formError);
    const request = new Request('http://localhost:3000/login', {
      method: 'POST',
      body: formData,
    });

    const response = await action({ request, context: {}, params: {} });

    expect(response.status).toEqual(400);
    expect(await response.json()).toEqual({ formError });
  });

  test('an invalid intent: returns a response with a 400 status code and a body containing the formError', async () => {
    const formData = new FormData();
    formData.set('_intent', 'invalid');
    const request = new Request('http://localhost:3000/login', {
      method: 'POST',
      body: formData,
    });

    const response = await action({ request, context: {}, params: {} });

    expect(response.status).toEqual(400);
    expect(await response.json()).toEqual({
      formError: 'Invalid intent: invalid',
    });
  });

  test('given no intent: returns a response with a 400 status code and a body containing the formError', async () => {
    const formData = new FormData();
    const request = new Request('http://localhost:3000/login', {
      method: 'POST',
      body: formData,
    });

    const response = await action({ request, context: {}, params: {} });

    expect(response.status).toEqual(400);
    expect(await response.json()).toEqual({ formError: 'Invalid intent: ' });
  });
});
