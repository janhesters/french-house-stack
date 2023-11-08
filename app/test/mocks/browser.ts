import type { RequestHandler } from 'msw';
import { setupWorker } from 'msw/browser';

const handlers: RequestHandler[] = [
  /* ... add your handlers for client side request mocking here ... */
];

export const worker = setupWorker(...handlers);
