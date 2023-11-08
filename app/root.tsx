import { cssBundleHref } from '@remix-run/css-bundle';
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  isRouteErrorResponse as getIsRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';

import darkStyles from '~/styles/dark.css';
import styles from '~/styles/tailwind.css';

import { GeneralErrorBoundary } from './components/general-error-boundary';
import type { EnvironmentVariables } from './entry.client';
import { i18next } from './features/localization/i18next.server';
import { NotFoundComponent } from './features/not-found/not-found-component';

export const handle = { i18n: 'common' };

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: styles },
  {
    rel: 'stylesheet',
    href: darkStyles,
    media: '(prefers-color-scheme: dark)',
  },
  { rel: 'icon', href: '/favicons/favicon.ico' },
  {
    rel: 'alternate icon',
    type: 'image/png',
    href: '/favicons/favicon-32x32.png',
  },
  { rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
  {
    rel: 'manifest',
    href: '/favicons/site.webmanifest',
    crossOrigin: 'use-credentials',
  },
  { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
];

type LoaderData = {
  ENV: EnvironmentVariables;
  locale: string;
  title: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
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

export const meta: MetaFunction<typeof loader> = ({
  data = { title: 'French House Stack' },
}) => [{ title: data.title }];

function useChangeLanguage(locale: string) {
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale, i18n]);
}

export default function App() {
  const { locale, ENV } = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();
  useChangeLanguage(locale);

  return (
    <html lang={locale} className="h-full" dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body className="h-full overscroll-none">
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
  const error = useRouteError();
  const isRouteErrorResponse = getIsRouteErrorResponse(error);
  const title = `${
    isRouteErrorResponse ? `${error.status} ${error.statusText}` : 'Oh no!'
  } | French House Stack`;

  return (
    <html className="h-full" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body className="h-full overscroll-none">
        {isRouteErrorResponse && error.status === 404 ? (
          <NotFoundComponent />
        ) : (
          <GeneralErrorBoundary />
        )}
        <Scripts />
      </body>
    </html>
  );
}
