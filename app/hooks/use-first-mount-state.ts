import { useRef } from 'react';

/**
 * A hook that detects if the current mount is the first one.
 *
 * @returns Returns true if component is just mounted (on first render) and
 * false otherwise.
 */
export function useFirstMountState() {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;

    return true;
  }

  return isFirst.current;
}
