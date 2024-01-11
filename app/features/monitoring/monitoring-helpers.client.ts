import { useLocation, useMatches } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { useEffect } from 'react';

export function initializeClientMonitoring() {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.ENVIRONMENT,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.remixRouterInstrumentation(
          useEffect,
          useLocation,
          useMatches,
        ),
      }),
      new Sentry.Replay(), // Replay is only available in the client.
    ],

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for
    // performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: 1,

    // Set `tracePropagationTargets` to control for which URLs distributed
    // tracing should be enabled.
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],

    // Capture Replay for 10% of all sessions, plus for 100% of sessions with an
    // error.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
  });
}
