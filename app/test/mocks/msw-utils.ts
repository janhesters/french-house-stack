import { http, passthrough } from 'msw';
import type { UnhandledRequestCallback } from 'node_modules/msw/lib/core/utils/request/onUnhandledRequest';

/**
 * Callback function to handle unhandled requests in MSW (Mock Service Worker).
 *
 * @param request - The unhandled request object.
 */
export const onUnhandledRequest: UnhandledRequestCallback = request => {
  // Opt out of request to localhost on the client and server.
  if (new URL(request.url).href.startsWith('http://localhost')) {
    return;
  }

  console.warn(
    '[MSW] Warning: captured a request without a matching request handler:\n\n',
    `  • ${request.method} ${new URL(request.url).href}\n\n`,
    'If you still wish to intercept this unhandled request, please create a request handler for it.\n',
    'Read more: https://mswjs.io/docs/getting-started/mocks',
  );
};

const REMIX_DEV_PING = new URL(
  process.env.REMIX_DEV_ORIGIN || 'http://test-origin',
);
REMIX_DEV_PING.pathname = '/ping';

/**
 * Lets MSW forward internal "dev ready" messages on `/ping`.
 *
 * @see https://remix.run/docs/en/main/other-api/dev#how-to-set-up-msw
 *
 * @returns A response object for the remix ping request.
 */
export const remixPingHandler = http.post(REMIX_DEV_PING.href, () =>
  passthrough(),
);
