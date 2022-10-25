import { test } from 'vitest';

import { assert } from '~/test/assert';

import { asyncPipe } from './async-pipe';

const asyncDouble = (n: number) => Promise.resolve(n * 2);
const asyncInc = (n: number) => Promise.resolve(n + 1);

test('asyncPipe()', async () => {
  const asyncIncDouble = asyncPipe(asyncInc, asyncDouble);

  assert({
    given: 'two promises',
    should: 'compose them in reverse mathematical order',
    actual: await asyncIncDouble(20),
    expected: 42,
  });
});
