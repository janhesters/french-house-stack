import { useEffect, useState } from 'react';

/**
 * A hook to detect whether the browser is missing a connection to the internet.
 *
 * @returns Whether browser offline or not.
 */
export function useIsOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      function handleOnline() {
        setIsOffline(false);
      }
      function handleOffline() {
        setIsOffline(true);
      }

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return function cleanup() {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return isOffline;
}
