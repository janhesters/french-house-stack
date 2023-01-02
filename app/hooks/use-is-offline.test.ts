import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useIsOffline } from './use-is-offline';

describe('useIsOffline()', () => {
  it('detects whether the user is offline or not', () => {
    const { result } = renderHook(() => useIsOffline());

    expect(result.current).toEqual(false);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current).toEqual(true);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current).toEqual(false);
  });
});
