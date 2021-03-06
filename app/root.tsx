import { ExclamationIcon } from '@heroicons/react/outline';
import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { useChangeLanguage } from 'remix-i18next';
import invariant from 'tiny-invariant';

import type { EnvironmentVariables } from './entry.client';
import i18next from './features/localization/i18next.server';
import styles from './tailwind.css';

export const handle = { i18n: 'common' };

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
];

type LoaderData = {
  ENV: EnvironmentVariables;
  locale: string;
  title: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const { MAGIC_PUBLISHABLE_KEY } = process.env;
  invariant(MAGIC_PUBLISHABLE_KEY, 'MAGIC_PUBLISHABLE_KEY must be set');

  const locale = await i18next.getLocale(request);

  const t = await i18next.getFixedT(request);
  const title = t('app-name');

  return json<LoaderData>({
    ENV: { MAGIC_PUBLISHABLE_KEY: MAGIC_PUBLISHABLE_KEY },
    locale,
    title,
  });
};

export const meta: MetaFunction = ({ data }) => {
  const { title } = data as LoaderData;

  return {
    // eslint-disable-next-line unicorn/text-encoding-identifier-case
    charset: 'utf-8',
    title: title || 'French House Stack',
    viewport: 'width=device-width,initial-scale=1',
  };
};

export default function App() {
  const { locale, ENV } = useLoaderData<LoaderData>();
  const { i18n } = useTranslation();
  useChangeLanguage(locale);

  return (
    <html lang={locale} className="h-full bg-gray-100" dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  // TODO: report error
  const location = useLocation();

  return (
    <html className="h-full bg-gray-100">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <main className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h1 className="text-lg leading-6 font-medium text-gray-900">
                      Ooops! ????
                    </h1>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        An unknown error occurred. We've automatically reported
                        the error and we will investigate it{' '}
                        <i>
                          <b>asap</b>
                        </i>
                        ! ????
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        We're very sorry about this! ???? Please reload the page.
                        ????
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Link
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  to={location.pathname + location.search}
                >
                  Reload Page
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Scripts />
      </body>
    </html>
  );
}
