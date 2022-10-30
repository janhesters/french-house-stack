// @vitest-environment node
import { faker } from '@faker-js/faker';
import { describe } from 'vitest';

import { assert } from '~/test/assert';

import getPageTitle from './get-page-title.server';

describe('getPageTitle()', async () => {
  {
    const request = new Request(faker.internet.url());

    assert({
      given: 'a request with neither a prefix nor a tKey',
      should: 'return the app name',
      actual: await getPageTitle(request),
      expected: 'French House Stack',
    });
  }

  {
    const request = new Request(faker.internet.url());
    const tKey = 'user-profile:profile';

    assert({
      given: 'a request, a tKey, and no prefix',
      should: 'return the app name with the translated value for the tKey',
      actual: await getPageTitle(request, tKey),
      expected: 'Profile | French House Stack',
    });
  }

  {
    const request = new Request(faker.internet.url());
    const prefix = faker.word.noun();

    assert({
      given: 'a request, a prefix, and no tKey',
      should: 'return the app name with the prefix',
      actual: await getPageTitle(request, '', prefix),
      expected: `${prefix} | French House Stack`,
    });
  }

  {
    const request = new Request(faker.internet.url());
    const prefix = faker.word.noun();
    const tKey = 'user-profile:email';

    assert({
      given: 'a request, a prefix, and a tKey',
      should:
        'return the app name with the prefix and the translated value for the tKey',
      actual: await getPageTitle(request, tKey, prefix),
      expected: `${prefix} Email | French House Stack`,
    });
  }

  {
    const request = new Request(faker.internet.url());
    const tKey = 'user-authentication:invalid-intent';
    const intent = faker.random.word();
    const options = { intent };

    assert({
      given: 'a request, a tKey with options, and no prefix',
      should:
        'return the app name with the translated value for the tKey and options',
      actual: await getPageTitle(request, { tKey, options }),
      expected: `Invalid intent: ${intent} | French House Stack`,
    });
  }

  {
    const request = new Request(faker.internet.url());
    const tKey = 'user-authentication:invalid-intent';
    const intent = faker.random.word();
    const options = { intent };
    const prefix = faker.word.noun();

    assert({
      given: 'a request, a tKey with options, and a prefix',
      should:
        'return the app name with the prefix and the translated value for the tKey and options',
      actual: await getPageTitle(request, { tKey, options }, prefix),
      expected: `${prefix} Invalid intent: ${intent} | French House Stack`,
    });
  }
});
