import { useRef } from 'react';

type Reference<T> = [
  Promise<T>,
  (value: T | PromiseLike<T>) => void,
  (reason?: any) => void,
];

/**
 * @returns An array containing [promise, resolve, reject].
 */
export function usePromise<T>() {
  const reference = [] as unknown as Reference<T>;
  const container = useRef(reference);

  reference[0] = new Promise<T>((resolve, reject) => {
    reference[1] = resolve;
    reference[2] = reject;
  });

  return container.current;
}
