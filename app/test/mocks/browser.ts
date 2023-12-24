import { setupWorker } from 'msw/browser';

import { exampleHandlers } from './handlers/example';

const handlers = [...exampleHandlers];

export const worker = setupWorker(...handlers);
