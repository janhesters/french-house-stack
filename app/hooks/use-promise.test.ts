import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePromise } from './use-promise';

const getPromiseState = <T>(p: Promise<T>) => {
  const t = {};
  return Promise.race([p, t]).then(
    v => (v === t ? 'pending' : 'fulfilled'),
    () => 'rejected',
  );
};

describe('usePromise()', () => {
  it('handles resolving promises', async () => {
    const { result } = renderHook(() => usePromise());

    expect(await getPromiseState(result.current[0])).toEqual('pending');

    const testValue = { foo: 'bar' };

    act(() => {
      result.current[1](testValue);
    });

    expect(await getPromiseState(result.current[0])).toEqual('fulfilled');
    expect(await result.current[0]).toEqual(testValue);
  });

  it('handles rejecting promises', async () => {
    const { result } = renderHook(() => usePromise());

    const testValue = { foo: 'bar' };

    act(() => {
      result.current[2](testValue);
    });

    expect(await getPromiseState(result.current[0])).toEqual('rejected');
    expect(await result.current[0].catch(error => error)).toEqual(testValue);
  });
});
