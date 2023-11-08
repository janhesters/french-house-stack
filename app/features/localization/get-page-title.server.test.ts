import type { TFunction } from 'i18next';
import { describe, expect, test } from 'vitest';

import { getPageTitle } from './get-page-title.server';

const t = ((key: string, options?: { name: string }) =>
  ({
    'app-name': 'AppName',
    dashboard: 'Dashboard',
    greeting: `Hello ${options?.name}`,
  })[key] ?? null) as TFunction;

describe('getPageTitle()', () => {
  test('given no tKey and prefix: returns the app name', () => {
    const actual = getPageTitle(t);
    const expected = 'AppName';

    expect(actual).toEqual(expected);
  });

  test('given a tKey as a string and no prefix: returns the translated tKey concatenated with the app name', () => {
    const tKey = 'dashboard';
    const expectedTranslation = 'Dashboard';

    const actual = getPageTitle(t, tKey);
    const expected = `${expectedTranslation} | AppName`;

    expect(actual).toEqual(expected);
  });

  test('given a tKey as an object and no prefix: returns the translated tKey (with options) concatenated with the app name', () => {
    const tKey = { tKey: 'greeting', options: { name: 'Bob' } };
    const expectedTranslation = 'Hello Bob';

    const actual = getPageTitle(t, tKey);
    const expected = `${expectedTranslation} | AppName`;

    expect(actual).toEqual(expected);
  });

  test('given a tKey and a prefix: returns the prefix, translated tKey, and app name', () => {
    const tKey = 'dashboard';
    const prefix = 'Welcome to';
    const expectedTranslation = 'Dashboard';

    const actual = getPageTitle(t, tKey, prefix);
    const expected = `${prefix} ${expectedTranslation} | AppName`;

    expect(actual).toEqual(expected);
  });
});
