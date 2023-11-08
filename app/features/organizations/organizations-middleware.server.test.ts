import { describe, expect, test } from 'vitest';

import { createPopulatedOrganization } from './organizations-factories.server';
import { withOrganizationSlug } from './organizations-middleware.server';

describe('withOrganizationSlug()', () => {
  test('given an object with params with an organization slug: adds an organization slug to the object', () => {
    const organizationSlug = createPopulatedOrganization().slug;
    const object = { params: { organizationSlug }, otherData: 'data' };

    const actual = withOrganizationSlug(object);
    const expected = {
      params: { organizationSlug },
      otherData: 'data',
      organizationSlug,
    };

    expect(actual).toEqual(expected);
  });

  test('given an object with params without an organization slug: adds an empty organization slug to the object', () => {
    const object = { params: {}, otherData: 'data' };

    const actual = withOrganizationSlug(object);
    const expected = { params: {}, otherData: 'data', organizationSlug: '' };

    expect(actual).toEqual(expected);
  });
});
