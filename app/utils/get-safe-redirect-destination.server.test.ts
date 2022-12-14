/**
 * @vitest-environment jsdom
 */
import { describe } from 'vitest';

import { assert } from '~/test/assert';

import getSafeRedirectDestination, {
  isValidRedirectDestination,
} from './get-safe-redirect-destination.server';

describe('isValidRedirectDestination()', () => {
  assert({
    given: 'a valid redirect destination',
    should: 'return the redirect destination',
    actual: isValidRedirectDestination('/notes'),
    expected: true,
  });

  assert({
    given: 'no redirect destination and no default redirect destination',
    should: 'return false',
    actual: isValidRedirectDestination(null),
    expected: false,
  });

  [new File([], 'foo'), 'home', '//home'].forEach(invalidDestination => {
    assert({
      given: 'given an invalid redirect destination (e.g. a file)',
      should: 'return false',
      actual: isValidRedirectDestination(invalidDestination),
      expected: false,
    });
  });
});

describe('getSafeRedirectDestination()', () => {
  const destination = '/profile';
  const request = new Request(
    `http://localhost:3000?redirectTo=${destination}`,
  );

  assert({
    given: 'given a request with a url',
    should: 'return the safe redirect destination',
    actual: getSafeRedirectDestination(request),
    expected: destination,
  });
});
