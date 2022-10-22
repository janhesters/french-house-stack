import { faker } from '@faker-js/faker';
import { describe, vi, vitest } from 'vitest';

import { assert } from './assert';

const asyncInc = (n: number) => Promise.resolve(n + 1);
const wait = (ms: number) =>
  new Promise<number>(resolve => setTimeout(() => resolve(ms), ms));

describe('assert', () => {
  assert({
    given: 'true',
    should: 'be true',
    actual: true,
    expected: true,
  });

  assert.skip({
    given: 'assert is called with .skip',
    should: 'skip the test',
    actual: true,
    expected: false,
  });

  assert.todo({
    given: 'assert is called with .todo',
    should: 'skip the test and mark it as todo',
    actual: true,
    expected: false,
  });
});

describe('async assert', async () => {
  const result = await asyncInc(41);

  assert({
    given: 'the await is done before the assert',
    should: 'execute the code correctly',
    actual: result,
    expected: 42,
  });

  assert({
    given: 'the await is done inline within the assert',
    should: 'execute the code correctly',
    actual: await asyncInc(41),
    expected: 42,
  });

  vi.useFakeTimers();
  const time = faker.datatype.number() + 5000;
  // eslint-disable-next-line testing-library/await-async-utils
  const waitPromise = wait(time);
  vitest.advanceTimersByTime(time);

  assert({
    given: 'doing other vitest things like messing with the timers',
    should: 'still assert the correct thing',
    actual: await waitPromise,
    expected: time,
  });

  vi.useRealTimers();
});
