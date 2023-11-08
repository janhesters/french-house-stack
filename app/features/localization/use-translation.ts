import { useTranslation as useTranslationI18Next } from 'react-i18next';

type UseTranslationType = typeof useTranslationI18Next;

/**
 * A custom hook that wraps the `useTranslation` hook from `react-i18next`.
 * This hook is designed to ensure that if a translation key does not exist,
 * an empty string is returned instead of `null`. It helps to avoid rendering
 * `null` values in the UI when a translation is missing.
 *
 * @param params - The parameters that you would normally pass to
 * `useTranslation` from `react-i18next`. This can include namespaces or other
 * options.
 *
 * @returns An object containing:
 *   - `t`: A translation function that behaves like the original `t` function,
 *     but returns an empty string for missing translations.
 *   - Rest of the properties returned by React i18next's `useTranslation`.
 *
 * @example
 * const { t } = useTranslation();
 * console.log(t('missing.key')); // Outputs: ''
 */
export const useTranslation = (...params: Parameters<UseTranslationType>) => {
  const { t, ...rest } = useTranslationI18Next(...params);

  const translate = (...arguments_: Parameters<typeof t>): string =>
    t(...arguments_) || '';

  return { t: translate, ...rest };
};
