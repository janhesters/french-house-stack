import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { createPopulatedUserProfile } from './user-profile-factories.server';
import {
  getNameAbbreviation,
  throwIfUserProfileIsMissing,
} from './user-profile-helpers.server';

describe('throwIfUserProfileIsMissing()', () => {
  test('given a request and a user profile: returns the user profile', async () => {
    const user = createPopulatedUserProfile();

    expect(
      await throwIfUserProfileIsMissing(
        new Request(faker.internet.url()),
        user,
      ),
    ).toEqual(user);
  });

  test('given a request and null: throws a redirect to the login page and logs the user out', async () => {
    expect.assertions(3);

    try {
      await throwIfUserProfileIsMissing(
        new Request(faker.internet.url()),
        null,
      );
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(302);
        expect(error.headers.get('Location')).toEqual('/login');
        expect(error.headers.get('Set-Cookie')).toEqual(
          '__user-authentication-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
        );
      }
    }
  });
});

describe('getNameAbbreviation()', () => {
  test('given a full name that consists of a first name and a last name: returns the first letter of the first name and the first letter of the last name', () => {
    const name = 'John Smith';

    const actual = getNameAbbreviation(name);
    const expected = 'JS';

    expect(actual).toEqual(expected);
  });

  test('given a full name that consists of only a first name: returns the first letter of the first name', () => {
    const name = 'John';

    const actual = getNameAbbreviation(name);
    const expected = 'J';

    expect(actual).toEqual(expected);
  });

  test('given a full name that consists of a first name and a last name and a middle name: returns the first letter of the first name and the first letter of the last name', () => {
    const name = 'Kent C. Dodds';

    const actual = getNameAbbreviation(name);
    const expected = 'KD';

    expect(actual).toEqual(expected);
  });

  test('given a name that contains special characters and weird capitalization: returns the first letter of the first and last word (if it exists)', () => {
    const name = 'John$Doe';

    const actual = getNameAbbreviation(name);
    const expected = 'J';

    expect(actual).toEqual(expected);
  });

  test('given a name that is an empty string: returns an empty string', () => {
    const name = '';

    const actual = getNameAbbreviation(name);
    const expected = '';

    expect(actual).toEqual(expected);
  });

  test('given a name that contains multiple spaces between words: returns the first letter of the first and last word', () => {
    const name = 'García    Márquez';

    const actual = getNameAbbreviation(name);
    const expected = 'GM';

    expect(actual).toEqual(expected);
  });

  test('given a name that contains leading or trailing spaces: returns the first letter of the first and last word', () => {
    const name = ' John Doe ';

    const actual = getNameAbbreviation(name);
    const expected = 'JD';

    expect(actual).toEqual(expected);
  });
});
