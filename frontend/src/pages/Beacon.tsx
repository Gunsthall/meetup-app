import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useWakeLock } from '../hooks/useWakeLock';
import { useWebSocket } from '../hooks/useWebSocket';
import { useGeolocation } from '../hooks/useGeolocation';
import { blinkIntervalFromDistance } from '../utils/blinkSpeed';
import type { WSResponse, Role } from '../types';

export function Beacon() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { session, setSession, distance, setDistance, role } = useSession();
  const [isBlinking, setIsBlinking] = useState(true);

  // Keep screen awake
  useWakeLock(true);

  // Track location
  const location = useGeolocation();

  // WebSocket connection to receive session data
  const { isConnected, sendMessage } = useWebSocket({
    sessionCode: code!,
    role: (role || 'passenger') as Role,
    onMessage: handleWSMessage,
  });

  function handleWSMessage(message: WSResponse) {
    console.log('[Beacon] WS Message:', message);
    if (message.type === 'state' && message.session) {
      setSession(message.session);
      if (message.distance !== undefined) {
        console.log('[Beacon] Distance updated:', message.distance);
        setDistance(message.distance);
      }
    }

    if (message.type === 'ended') {
      navigate('/');
    }
  }

  // Send location updates
  useEffect(() => {
    if (location.latitude && location.longitude && isConnected) {
      console.log('[Beacon] Sending location:', location.latitude, location.longitude);
      sendMessage({
        type: 'location',
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || 0,
      });
    } else {
      console.log('[Beacon] Location not ready:', {
        lat: location.latitude,
        lng: location.longitude,
        connected: isConnected,
        error: location.error
      });
    }
  }, [location.latitude, location.longitude, isConnected, sendMessage, location.error]);

  // Blink effect based on distance
  useEffect(() => {
    if (!distance) {
      // Default blink when no distance
      const timer = setInterval(() => {
        setIsBlinking((prev) => !prev);
      }, 1000);
      return () => clearInterval(timer);
    }

    const interval = blinkIntervalFromDistance(distance);
    const timer = setInterval(() => {
      setIsBlinking((prev) => !prev);
    }, interval);

    return () => clearInterval(timer);
  }, [distance]);

  const handleBack = () => {
    navigate(-1);
  };

  // Fullscreen on landscape orientation
  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.screen.orientation) {
        const isLandscape = window.screen.orientation.type.includes('landscape');

        if (isLandscape && !document.fullscreenElement) {
          // Enter fullscreen in landscape
          document.documentElement.requestFullscreen?.().catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        } else if (!isLandscape && document.fullscreenElement) {
          // Exit fullscreen in portrait
          document.exitFullscreen?.().catch(err => {
            console.log('Exit fullscreen failed:', err);
          });
        }
      }
    };

    // Listen for orientation changes
    window.screen.orientation?.addEventListener('change', handleOrientationChange);

    // Check initial orientation
    handleOrientationChange();

    return () => {
      window.screen.orientation?.removeEventListener('change', handleOrientationChange);
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Beacon - Session:', session);
    console.log('Beacon - Distance:', distance);
    console.log('Beacon - Code:', code);
    console.log('Beacon - WebSocket Connected:', isConnected);
    console.log('Beacon - Role:', role);
  }, [session, distance, code, isConnected, role]);

  // Use default values if session not loaded yet
  const driverName = session?.driver?.name || 'LOADING';
  const visualColor = session?.visual?.color || '#3B82F6'; // Default blue
  const backgroundColor = isBlinking ? visualColor : '#000000';

  // Determine text color based on background
  const textColor = isBlinking ? '#FFFFFF' : '#FFFFFF';
  const textShadow = isBlinking
    ? '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)'
    : '0 0 20px rgba(255,255,255,0.5)';

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-200 overflow-hidden"
      style={{ backgroundColor }}
      onClick={handleBack}
    >
      <div className="text-center px-4 py-2 max-w-full">
        <h1
          className="font-bold mb-2"
          style={{
            fontSize: 'clamp(2.5rem, 12vw, 10rem)',
            color: textColor,
            textShadow,
            WebkitTextStroke: isBlinking ? '2px rgba(0,0,0,0.3)' : '2px rgba(255,255,255,0.3)',
            lineHeight: '1.1'
          }}
        >
          {driverName.toUpperCase()}
        </h1>
        <p
          className="font-mono font-bold mb-1"
          style={{
            fontSize: 'clamp(1.2rem, 6vw, 3.5rem)',
            color: textColor,
            textShadow,
            letterSpacing: '0.1em'
          }}
        >
          {code}
        </p>
        {distance !== null && (
          <p
            className="mt-2 font-bold"
            style={{
              fontSize: 'clamp(1rem, 4vw, 2rem)',
              color: textColor,
              textShadow
            }}
          >
            {distance < 10 ? '🎯 VERY CLOSE!' : `📍 ${Math.round(distance)}m away`}
          </p>
        )}
        <p
          className="mt-4 text-xs opacity-75"
          style={{ color: textColor, fontSize: 'clamp(0.7rem, 2vw, 0.9rem)' }}
        >
          Tap anywhere to exit
        </p>
      </div>
    </div>
  );
}
