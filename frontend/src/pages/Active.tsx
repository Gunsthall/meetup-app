import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useWebSocket } from '../hooks/useWebSocket';
import { useVibration } from '../hooks/useVibration';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { formatDistance } from '../utils/distance';
import type { Role, WSResponse } from '../types';

export function Active() {
  const { code, role: urlRole } = useParams<{ code: string; role: string }>();
  const navigate = useNavigate();
  const { session, setSession, distance, setDistance } = useSession();
  const { vibrate } = useVibration();

  const role = urlRole as Role;

  // Track location
  const location = useGeolocation();

  // WebSocket connection
  const { isConnected, sendMessage } = useWebSocket({
    sessionCode: code!,
    role,
    onMessage: handleWSMessage,
  });

  // Share URL functionality
  const [shareUrl] = useState(
    `${window.location.origin}/${code}`
  );

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

  // Send location updates
  useEffect(() => {
    if (location.latitude && location.longitude && isConnected) {
      sendMessage({
        type: 'location',
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || 0,
      });
    }
  }, [location.latitude, location.longitude, isConnected, sendMessage]);

  // Vibrate when close
  useEffect(() => {
    if (distance && distance < 20) {
      vibrate(session?.visual.pattern || [200, 100, 200]);
    }
  }, [distance, session, vibrate]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MeetUp - Join my session',
          text: `Join my pickup session with code: ${code}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleBeacon = () => {
    navigate(`/session/${code}/beacon`);
  };

  const handleMet = () => {
    sendMessage({ type: 'met' });
    navigate('/');
  };

  if (location.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage
          message={`Location error: ${location.error}. Please enable location permissions.`}
        />
      </div>
    );
  }

  if (location.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  const otherRole = role === 'driver' ? 'passenger' : 'driver';
  const otherConnected = session?.[otherRole]?.connected;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Active</h1>
          <p className="text-gray-600">Code: <span className="font-mono font-bold text-2xl">{code}</span></p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">WebSocket</span>
            <span className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-700">
              {role === 'driver' ? 'Passenger' : 'Driver'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${otherConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {otherConnected ? 'Connected' : 'Waiting...'}
            </span>
          </div>
        </div>

        {/* Distance Display */}
        {distance !== null && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-2">Distance</p>
            <p className="text-5xl font-bold text-blue-600">{formatDistance(distance)}</p>
            {distance < 50 && (
              <p className="mt-3 text-green-600 font-medium">You're very close!</p>
            )}
          </div>
        )}

        {/* Visual Info */}
        {session && (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-2">Your beacon color:</p>
            <div
              className="h-16 rounded-lg"
              style={{ backgroundColor: session.visual.color }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {role === 'driver' && (
            <Button fullWidth variant="secondary" onClick={handleShare}>
              Share Link
            </Button>
          )}

          <Button fullWidth onClick={handleBeacon}>
            Activate Beacon
          </Button>

          <Button fullWidth variant="primary" onClick={handleMet}>
            We Met!
          </Button>

          <Button fullWidth variant="secondary" onClick={() => navigate('/')}>
            Cancel Session
          </Button>
        </div>
      </div>
    </div>
  );
}
