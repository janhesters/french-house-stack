// @vitest-environment node
import { faker } from '@faker-js/faker';
import { describe, vi } from 'vitest';

import { magicAdmin } from '~/features/user-authentication/magic-admin.server';
import { createPopulatedUserProfile } from '~/features/user-profile/user-profile-factories.server';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '~/features/user-profile/user-profile-model.server';
import { assert } from '~/test/assert';
import { generateRandomDid } from '~/test/generate-random-did.server';

import { action } from './login';

describe('login page action', async () => {
  {
    const formData = new FormData();
    formData.set('_intent', 'login');
    const email = faker.internet.email();
    formData.set('email', email);
    const request = new Request('http://localhost:3000/login', {
      method: 'POST',
      body: formData,
    });

    const response = await action({ request, context: {}, params: {} });

    assert({
      given: 'a login intent with an email',
      should: 'return a response with a body containing the email',
      actual: await response.json(),
      expected: { email },
    });
  }

  {
    const given = 'a magic intent with a DID token';

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

    assert({
      given,
      should: 'return a response with a 302 status',
      actual: response.status,
      expected: 302,
    });

    assert({
      given,
      should: 'redirect the user to the home page',
      actual: response.headers.get('location'),
      expected: '/home',
    });

    assert({
      given,
      should: 'set a cookie with the user ID encoded',
      actual: response.headers
        .get('set-cookie')
        ?.includes('__user-authentication-session=ey'),
      expected: true,
    });

    await deleteUserProfileFromDatabaseById(userProfile.id);
  }

  {
    const formData = new FormData();
    formData.set('_intent', 'magicError');
    const formError = faker.lorem.sentence();
    formData.set('formError', formError);
    const request = new Request('http://localhost:3000/login', {
      method: 'POST',
      body: formData,
    });

    const response = await action({ request, context: {}, params: {} });

    assert({
      given: 'a magic error intent with formError values',
      should: 'return a response with a body containing the formError',
      actual: await response.json(),
      expected: { formError },
    });
  }

  {
    const given = 'no intent';

    const formData = new FormData();
    const request = new Request('http://localhost:3000/login', {
      method: 'POST',
      body: formData,
    });

    const response = await action({ request, context: {}, params: {} });

    assert({
      given,
      should: 'return a response with a 400 status code',
      actual: response.status,
      expected: 400,
    });

    assert({
      given,
      should: 'return a response with a body containing the formError values',
      actual: await response.json(),
      expected: { formError: 'Invalid intent: ' },
    });
  }
});
