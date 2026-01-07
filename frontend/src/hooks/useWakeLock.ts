import { useEffect, useRef } from 'react';

/**
 * Hook to keep screen awake
 */
export function useWakeLock(enabled: boolean = true) {
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Check if Wake Lock API is supported
    if (!('wakeLock' in navigator)) {
      console.warn('Wake Lock API not supported');
      return;
    }

    const requestWakeLock = async () => {
      try {
        wakeLock.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock activated');

        wakeLock.current.addEventListener('release', () => {
          console.log('Wake Lock released');
        });
      } catch (err) {
        console.error('Failed to activate Wake Lock:', err);
      }
    };

    requestWakeLock();

    // Re-request wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLock.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock.current) {
        wakeLock.current.release();
        wakeLock.current = null;
      }
    };
  }, [enabled]);

  return wakeLock.current !== null;
}
