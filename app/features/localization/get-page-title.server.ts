import type { TFunction, TOptions } from 'i18next';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type $Dictionary<T = any> = { [key: string]: T };

/**
 * Helper function to get the page title.
 *
 * @param tFunc - An i18next translation function.
 * @param tKey - Translation key or key options pair to add a translated prefix
 * title.
 * @param prefix - A custom prefix to add to the title.
 * @returns A string containing the page title.
 */
export function getPageTitle(
  t: TFunction,
  tKey:
    | string
    | {
        tKey: string;
        options: TOptions<$Dictionary>;
      } = '',
  prefix = '',
) {
  const translation =
    typeof tKey === 'string'
      ? t(tKey)
      : 'tKey' in tKey
        ? t(tKey.tKey, tKey.options)
        : t(tKey);
  const concatenatedPrefix = `${prefix} ${translation || ''}`.trim();
  return concatenatedPrefix
    ? `${concatenatedPrefix} | ${t('app-name')}`
    : t('app-name');
}
