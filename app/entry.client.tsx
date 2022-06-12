import { RemixBrowser } from '@remix-run/react';
import { hydrateRoot } from 'react-dom/client';

import type { EnvironmentVariables } from './entry.server';

declare global {
  var ENV: EnvironmentVariables;

  interface Window {
    Cypress?: Cypress.Cypress;
  }
}

if (window.Cypress) {
  // eslint-disable-next-line unicorn/prefer-module
  require('react-dom').hydrate(<RemixBrowser />, document);
} else {
  hydrateRoot(document, <RemixBrowser />);
}
