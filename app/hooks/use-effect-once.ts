import type { EffectCallback } from 'react';
import { useEffect } from 'react';

import { useFirstMountState } from './use-first-mount-state';

/**
 * Accepts a function that contains imperative, possibly effectful code.
 * It executes that function exactly once.
 *
 * Can be used to avoid shooting us in the foot with React 18 and strict mode.
 * @see https://reactjs.org/docs/strict-mode.html#ensuring-reusable-state
 * @see https://github.com/reactwg/react-18/discussions/18
 *
 * @param effect Imperative function that can return a cleanup function
 */
export function useEffectOnce(effect: EffectCallback) {
  const isFirstMount = useFirstMountState();

  useEffect(() => {
    if (isFirstMount) {
      return effect();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
