import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useEffectOnce } from './use-effect-once';

describe('useEffectOnce()', () => {
  it('runs the effect exactly once', () => {
    const effect = vi.fn();

    expect(effect).not.toHaveBeenCalled();

    const { rerender } = renderHook(() => useEffectOnce(effect));

    expect(effect).toHaveBeenCalledOnce();

    rerender();

    expect(effect).toHaveBeenCalledOnce();
  });
});
