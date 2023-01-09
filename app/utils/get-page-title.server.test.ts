// @vitest-environment node
import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { getPageTitle } from './get-page-title.server';

describe('getPageTitle()', async () => {
  test('given a request with neither a prefix nor a tKey: returns the app name', async () => {
    const request = new Request(faker.internet.url());

    expect(await getPageTitle(request)).toEqual('French House Stack');
  });

  test('given a request, a tKey, and no prefix: returns the app name with the translated value for the tKey', async () => {
    const request = new Request(faker.internet.url());
    const tKey = 'user-profile:profile';

    expect(await getPageTitle(request, tKey)).toEqual(
      'Profile | French House Stack',
    );
  });

  test('given a request, a prefix, and no tKey: returns the app name with the prefix', async () => {
    const request = new Request(faker.internet.url());
    const prefix = faker.word.noun();

    expect(await getPageTitle(request, '', prefix)).toEqual(
      `${prefix} | French House Stack`,
    );
  });

  test('given a request, a prefix, and a tKey: returns the app name with the prefix and the translated value for the tKey', async () => {
    const request = new Request(faker.internet.url());
    const prefix = faker.word.noun();
    const tKey = 'user-profile:email';

    expect(await getPageTitle(request, tKey, prefix)).toEqual(
      `${prefix} Email | French House Stack`,
    );
  });

  test('given a request, a tKey with options, and no prefix: returns the app name with the translated value for the tKey and options', async () => {
    const request = new Request(faker.internet.url());
    const tKey = 'user-authentication:invalid-intent';
    const intent = faker.random.word();
    const options = { intent };

    expect(await getPageTitle(request, { tKey, options })).toEqual(
      `Invalid intent: ${intent} | French House Stack`,
    );
  });

  test('given a request, a tKey with options, and a prefix: returns the app name with the prefix and the translated value for the tKey and options', async () => {
    const request = new Request(faker.internet.url());
    const tKey = 'user-authentication:invalid-intent';
    const intent = faker.random.word();
    const options = { intent };
    const prefix = faker.word.noun();

    expect(await getPageTitle(request, { tKey, options }, prefix)).toEqual(
      `${prefix} Invalid intent: ${intent} | French House Stack`,
    );
  });
});
