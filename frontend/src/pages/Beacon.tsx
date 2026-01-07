import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useWakeLock } from '../hooks/useWakeLock';
import { blinkIntervalFromDistance } from '../utils/blinkSpeed';

export function Beacon() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { session, distance } = useSession();
  const [isBlinking, setIsBlinking] = useState(true);

  // Keep screen awake
  useWakeLock(true);

  // Blink effect based on distance
  useEffect(() => {
    if (!distance) return;

    const interval = blinkIntervalFromDistance(distance);
    const timer = setInterval(() => {
      setIsBlinking((prev) => !prev);
    }, interval);

    return () => clearInterval(timer);
  }, [distance]);

  const handleBack = () => {
    navigate(-1);
  };

  if (!session) {
    return null;
  }

  const driverName = session.driver.name;
  const backgroundColor = isBlinking ? session.visual.color : '#000000';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center transition-colors duration-200"
      style={{ backgroundColor }}
      onClick={handleBack}
    >
      <div className="text-center p-8">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-lg">
          {driverName.toUpperCase()}
        </h1>
        <p className="text-2xl md:text-4xl text-white font-mono drop-shadow-lg">
          {code}
        </p>
        {distance !== null && (
          <p className="mt-8 text-xl text-white drop-shadow-lg">
            {distance < 10 ? 'Very close!' : `${Math.round(distance)}m away`}
          </p>
        )}
        <p className="mt-12 text-white text-opacity-75 text-sm">
          Tap anywhere to exit
        </p>
      </div>
    </div>
  );
}
