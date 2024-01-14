/* eslint-disable unicorn/prefer-module */
import { resolve } from 'node:path';
import { PassThrough } from 'node:stream';

import type { HandleDocumentRequestFunction } from '@remix-run/node';
import { createReadableStreamFromReadable } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { createInstance } from 'i18next';
import Backend from 'i18next-fs-backend';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import { i18n } from './features/localization/i18n';
import { i18next } from './features/localization/i18next.server';

if (process.env.SERVER_MOCKS === 'true') {
  // @ts-expect-error - global is readonly and for some reason MSW accesses it.
  global.location = { protocol: 'http', host: 'localhost' };
  const { magicHandlers } = require('./test/mocks/handlers/magic');
  require('./test/mocks/server').startMockServer([...magicHandlers]);
}

if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  const { initializeServerMonitoring } = await import(
    './features/monitoring/monitoring-helpers.server'
  );
  initializeServerMonitoring();
}

const ABORT_DELAY = 5000;

const handleRequest: HandleDocumentRequestFunction = async (
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
) => {
  const callbackName = isbot(request.headers.get('user-agent') || '')
    ? 'onAllReady'
    : 'onShellReady';

  const instance = createInstance();
  const lng = await i18next.getLocale(request);
  const ns = i18next.getRouteNamespaces(remixContext);

  await instance
    .use(initReactI18next)
    .use(Backend)
    .init({
      ...i18n,
      lng,
      ns,
      backend: {
        loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
      },
    });

  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={instance}>
        <RemixServer context={remixContext} url={request.url} />
      </I18nextProvider>,
      {
        [callbackName]() {
          const body = new PassThrough();

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = true;

          console.error(error);
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
};

export default handleRequest;

export { wrapRemixHandleError as handleError } from '@sentry/remix';
