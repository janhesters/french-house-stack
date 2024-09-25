import type { RequestHandler } from 'msw';
import { setupWorker } from 'msw/browser';

import { clerkHandlers } from './handlers/clerk';

const handlers: RequestHandler[] = [
  /* ... add your handlers for client side request mocking here ... */
  ...clerkHandlers,
];

export const worker = setupWorker(...handlers);
