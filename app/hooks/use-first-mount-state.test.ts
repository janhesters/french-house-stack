import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useFirstMountState } from './use-first-mount-state';

describe('useFirstMountState()', () => {
  it('returns true on the first mount and false afterwards', () => {
    const { rerender, result } = renderHook(() => useFirstMountState());

    expect(result.current).toEqual(true);

    rerender();

    expect(result.current).toEqual(false);
  });
});
