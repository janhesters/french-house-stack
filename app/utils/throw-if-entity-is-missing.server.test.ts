import { describe, expect, test } from 'vitest';

import { createPopulatedOrganization } from '~/features/organizations/organizations-factories.server';

import { throwIfEntityIsMissing } from './throw-if-entity-is-missing.server';

describe('throwIfEntityIsMissing()', () => {
  test('given an an entity: returns the entity', () => {
    const organization = createPopulatedOrganization();

    const actual = throwIfEntityIsMissing(organization);
    const expected = organization;

    expect(actual).toEqual(expected);
  });

  test('given null: throws a 404 not found error', () => {
    expect.assertions(1);

    try {
      throwIfEntityIsMissing(null);
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(404);
      }
    }
  });
});
