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
};
declare global {
  var ENV: EnvironmentVariables;

  interface Window {
    runMagicInTestMode?: boolean;
  }
}

async function prepareApp() {
  if (ENV.CLIENT_MOCKS === 'true') {
    const { worker } = await import('./test/mocks/browser');

    return worker.start({ onUnhandledRequest });
  }

  return;
}

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <I18nextProvider i18n={i18next}>
          <RemixBrowser />
        </I18nextProvider>
      </StrictMode>,
    );
  });
}

// eslint-disable-next-line unicorn/prefer-top-level-await
prepareApp().then(() =>
  i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(Backend)
    .init({
      ...i18n,
      ns: getInitialNamespaces(),
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        // requestOptions: { cache: 'no-cache' },
      },
      detection: { order: ['htmlTag'], caches: [] },
    })
    // eslint-disable-next-line unicorn/prefer-top-level-await
    .then(() => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(hydrate);
      } else {
        // Safari doesn't support requestIdleCallback
        // https://caniuse.com/requestidlecallback
        window.setTimeout(hydrate, 1);
      }
    }),
);
