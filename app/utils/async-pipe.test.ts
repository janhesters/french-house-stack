import { describe } from 'vitest';

import { asyncPipe } from './async-pipe';

const asyncDouble = (n: number) => Promise.resolve(n * 2);
const asyncInc = (n: number) => Promise.resolve(n + 1);

describe('asyncPipe()', () => {
  test('given two promises: composes them in reverse mathematical order', async () => {
    const asyncIncDouble = asyncPipe(asyncInc, asyncDouble);

    expect(await asyncIncDouble(20)).toEqual(42);
  });
});
