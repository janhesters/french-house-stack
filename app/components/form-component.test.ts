import { describe, expect, it } from 'vitest';

import { mapIdToAutoComplete } from './form-component';

describe('mapIdToAutoCompelete()', () => {
  it.each([
    [undefined, undefined],
    ['', undefined],
    ['some-id-that-maps-to-nothing', undefined],
    ['name', 'name'],
    ['firstName', 'given-name'],
    ['lastName', 'family-name'],
    ['emailAddress', 'email'],
    ['username', 'username'],
    ['country', 'country-name'],
    ['streetAddress', 'street-address'],
    ['city', 'address-level2'],
    ['stateProvince', 'address-level1'],
    ['zipPostalCode', 'postal-code'],
  ])('given an id: returns the correct autoComplete value', (id, expected) => {
    const actual = mapIdToAutoComplete(id);

    expect(actual).toEqual(expected);
  });
});
