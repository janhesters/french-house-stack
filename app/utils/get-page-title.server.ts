import type { TOptions } from 'i18next';

import { i18next } from '~/features/localization/i18next.server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type $Dictionary<T = any> = { [key: string]: T };

/**
 * Helper function to get the page title.
 *
 * @param request - A Request object.
 * @param tKey - Translation key or key options pair to add a translated prefix
 * title.
 * @param prefix - A custom prefix to add to the title.
 * @returns A string containing the page title.
 */
export async function getPageTitle(
  request: Request,
  tKey:
    | string
    | {
        tKey: string;
        options: TOptions<$Dictionary>;
      } = '',
  prefix = '',
) {
  const t = await i18next.getFixedT(request);
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
