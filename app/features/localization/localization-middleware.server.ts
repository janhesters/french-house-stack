import type { TFunction, TOptions } from 'i18next';

import { asyncPipe } from '~/utils/async-pipe';

import { getPageTitle } from './get-page-title.server';
import { i18next } from './i18next.server';

/**
 * Adds an i18next translation function to the middleware object.
 *
 * @param middleware - The middleware object with a request.
 * @returns The middleware object with a translation function.
 */
export const withTFunction = async <T extends { request: Request }>({
  request,
  ...rest
}: T) => ({
  request,
  ...rest,
  t: await i18next.getFixedT(request),
});

/**
 * Adds an i18next locale to the middleware object.
 *
 * @param middleware - The middleware object with a request.
 * @returns The middleware object with a locale.
 */
export const withLocale = async <T extends { request: Request }>({
  request,
  ...rest
}: T) => ({
  request,
  ...rest,
  locale: await i18next.getLocale(request),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type $Dictionary<T = any> = { [key: string]: T };

type PageTitleMiddlewareOptions = {
  tKey?:
    | string
    | {
        tKey: string;
        options: TOptions<$Dictionary>;
      };
  prefix?: string;
};

/**
 * Adds a page title to the middleware object.
 *
 * @param tKey - Translation key or key options pair to add a translated prefix
 * title.
 * @param prefix - A custom prefix to add to the title.
 * @param middleware - The middleware object with a translation function.
 * @returns The middleware object with a page title.
 */
export const withPageTitle =
  ({ tKey = '', prefix = '' }: PageTitleMiddlewareOptions = {}) =>
  async <T extends { t: TFunction }>({ t, ...rest }: T) => ({
    t,
    ...rest,
    pageTitle: getPageTitle(t, tKey, prefix),
  });

/**
 * Adds a translation function, locale, and page title to the middleware object.
 *
 * @param options - Options for the page title translation middleware.
 * @returns The middleware function for adding a translation function, locale,
 * and page title to a middleware object.
 */
export const withLocalization = (options: PageTitleMiddlewareOptions) =>
  asyncPipe(withTFunction, withLocale, withPageTitle(options));
