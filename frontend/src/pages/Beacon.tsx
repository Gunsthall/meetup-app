import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useWakeLock } from '../hooks/useWakeLock';
import { useWebSocket } from '../hooks/useWebSocket';
import { blinkIntervalFromDistance } from '../utils/blinkSpeed';
import type { WSResponse, Role } from '../types';

export function Beacon() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { session, setSession, distance, setDistance, role } = useSession();
  const [isBlinking, setIsBlinking] = useState(true);

  // Keep screen awake
  useWakeLock(true);

  // WebSocket connection to receive session data
  const { isConnected } = useWebSocket({
    sessionCode: code!,
    role: (role || 'passenger') as Role,
    onMessage: handleWSMessage,
  });

  function handleWSMessage(message: WSResponse) {
    if (message.type === 'state' && message.session) {
      setSession(message.session);
      if (message.distance !== undefined) {
        setDistance(message.distance);
      }
    }

    if (message.type === 'ended') {
      navigate('/');
    }
  }

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
      className="min-h-screen flex flex-col items-center justify-center transition-colors duration-200"
      style={{ backgroundColor }}
      onClick={handleBack}
    >
      <div className="text-center p-8">
        <h1
          className="font-bold mb-4"
          style={{
            fontSize: 'clamp(4rem, 20vw, 16rem)',
            color: textColor,
            textShadow,
            WebkitTextStroke: isBlinking ? '3px rgba(0,0,0,0.3)' : '3px rgba(255,255,255,0.3)'
          }}
        >
          {driverName.toUpperCase()}
        </h1>
        <p
          className="font-mono font-bold mb-4"
          style={{
            fontSize: 'clamp(1.5rem, 8vw, 5rem)',
            color: textColor,
            textShadow,
            letterSpacing: '0.1em'
          }}
        >
          {code}
        </p>
        {distance !== null && (
          <p
            className="mt-8 font-bold"
            style={{
              fontSize: 'clamp(1.25rem, 5vw, 2.5rem)',
              color: textColor,
              textShadow
            }}
          >
            {distance < 10 ? '🎯 VERY CLOSE!' : `📍 ${Math.round(distance)}m away`}
          </p>
        )}
        <p
          className="mt-12 text-sm opacity-75"
          style={{ color: textColor }}
        >
          Tap anywhere to exit
        </p>
      </div>
    </div>
  );
}
