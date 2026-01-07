import { useCallback } from 'react';

/**
 * Hook to trigger device vibration
 */
export function useVibration() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const stop = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }, []);

  return { vibrate, stop };
}
