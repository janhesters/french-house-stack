import type { EffectCallback } from 'react';
import { useEffect, useRef } from 'react';

/**
 * Let's avoid shooting us in the foot with React 18 and strict mode.
 * Accepts a function that contains imperative, possibly effectful code.
 * It executes that function exactly once.
 * @see https://reactjs.org/docs/strict-mode.html#ensuring-reusable-state
 * @see https://github.com/reactwg/react-18/discussions/18
 *
 * @param effect Imperative function that can return a cleanup function
 */
export default function useEffectOnce(effect: EffectCallback) {
  const didRunReference = useRef<boolean>(false);

  useEffect(() => {
    if (didRunReference.current === false) {
      didRunReference.current = true;

      return effect();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
