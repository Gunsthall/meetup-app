import { useState, useEffect } from 'react';
import type { GeolocationState } from '../types';

/**
 * Hook to track user's GPS location
 */
export function useGeolocation(enabled: boolean = true) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!enabled) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        error: 'Geolocation not supported',
        loading: false,
      }));
      return;
    }

    // Request permission explicitly first
    let watchId: number;
    console.log('[Geolocation] Requesting location permission...');

    // First get current position to trigger permission prompt
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[Geolocation] Permission granted, starting watch');
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });

        // Now start watching for updates
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            console.log('[Geolocation] Position update:', position.coords.latitude, position.coords.longitude);
            setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              error: null,
              loading: false,
            });
          },
          (error) => {
            console.error('[Geolocation] Watch error:', error.message);
            setState((s) => ({ ...s, error: error.message, loading: false }));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      },
      (error) => {
        console.error('[Geolocation] Permission denied or error:', error.message);
        setState((s) => ({ ...s, error: error.message, loading: false }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled]);

  return state;
}
