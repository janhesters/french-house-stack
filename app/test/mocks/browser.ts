import { setupWorker } from 'msw';

import { exampleHandlers } from './handlers/example';

const handlers = [...exampleHandlers];

export const worker = setupWorker(...handlers);
