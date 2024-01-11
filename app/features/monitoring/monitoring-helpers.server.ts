import * as Sentry from '@sentry/remix';

import { prisma } from '~/database.server';

export function initializeServerMonitoring() {
  Sentry.init({
    beforeSendTransaction(event) {
      // ignore all healthcheck related transactions
      //  note that name of header here is case-sensitive
      if (event.request?.headers?.['x-healthcheck'] === 'true') {
        // eslint-disable-next-line unicorn/no-null
        return null;
      }

      return event;
    },
    denyUrls: [
      /\/healthcheck/,
      // TODO: be smarter about the public assets...
      /\/build\//,
      /\/favicons\//,
      /\/img\//,
      /\/fonts\//,
      /\/favicon.ico/,
      /\/site\.webmanifest/,
    ],
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
    tracesSampler(samplingContext) {
      // ignore healthcheck transactions by other services (consul, etc.)
      if (samplingContext.request?.url?.includes('/healthcheck')) {
        return 0;
      }
      return 1;
    },
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 1 : 0,
  });
}
