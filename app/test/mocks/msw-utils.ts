import type { MockedRequest } from 'msw';

export function onUnhandledRequest(request: MockedRequest) {
  // Opt out of request to localhost on the client and server.
  if (request.url.href.startsWith('http://localhost')) {
    return;
  }

  console.warn(
    '[MSW] Warning: captured a request without a matching request handler:\n\n',
    `  • ${request.method} ${request.url.href}\n\n`,
    'If you still wish to intercept this unhandled request, please create a request handler for it.\n',
    'Read more: https://mswjs.io/docs/getting-started/mocks',
  );
}
