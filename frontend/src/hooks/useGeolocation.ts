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

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState((s) => ({ ...s, error: error.message, loading: false }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled]);

  return state;
}
