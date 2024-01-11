import { RemixBrowser } from '@remix-run/react';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { getInitialNamespaces } from 'remix-i18next';

import { i18n } from './features/localization/i18n';
import { onUnhandledRequest } from './test/mocks/msw-utils';

export type EnvironmentVariables = {
  MAGIC_PUBLISHABLE_KEY: string;
  CLIENT_MOCKS?: string;
  SENTRY_DSN?: string;
  ENVIRONMENT?: string;
};

declare global {
  var ENV: EnvironmentVariables;

  interface Window {
    runMagicInTestMode?: boolean;
  }
}

if (ENV.ENVIRONMENT === 'production' && ENV.SENTRY_DSN) {
  const { initializeClientMonitoring } = await import(
    './features/monitoring/monitoring-helpers.client'
  );
  initializeClientMonitoring();
}

async function activateMsw() {
  if (ENV.CLIENT_MOCKS === 'true') {
    const { worker } = await import('./test/mocks/browser');

    return worker.start({ onUnhandledRequest });
  }

  return;
}

async function hydrate() {
  await activateMsw();

  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(Backend)
    .init({
      ...i18n,
      ns: getInitialNamespaces(),
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        requestOptions: { cache: 'no-cache' },
      },
      detection: { order: ['htmlTag'], caches: [] },
    });

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <RemixBrowser />
        </StrictMode>
      </I18nextProvider>,
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
