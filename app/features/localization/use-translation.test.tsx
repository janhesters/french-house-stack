import { renderHook } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, test } from 'vitest';

import i18n from '~/test/i18n';

import { useTranslation } from './use-translation';

describe('useTranslation()', () => {
  test('given a key for a translation that exists: returns the correct translation', () => {
    const { result } = renderHook(() => useTranslation('login'), {
      wrapper: ({ children }) => (
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      ),
    });

    const actual = result.current.t('login');
    const expected = 'Login';

    expect(actual).toEqual(expected);
  });

  test('given a key for a translation that does NOT exist: returns the key (instead of null)', () => {
    const { result } = renderHook(() => useTranslation('login'), {
      wrapper: ({ children }) => (
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      ),
    });

    const actual = result.current.t('does-not-exist');
    const expected = 'does-not-exist';

    expect(actual).toEqual(expected);
  });
});
