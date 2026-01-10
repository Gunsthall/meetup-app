import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useWebSocket } from '../hooks/useWebSocket';
import { useVibration } from '../hooks/useVibration';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { formatDistance } from '../utils/distance';
import type { Role, WSResponse } from '../types';

export function Active() {
  const { code, role: urlRole } = useParams<{ code: string; role: string }>();
  const navigate = useNavigate();
  const { session, setSession, distance, setDistance } = useSession();
  const { vibrate } = useVibration();

  const role = urlRole as Role;
  const [loading, setLoading] = useState(true);

  // Mark loading as false once WebSocket connects and we get session data
  useEffect(() => {
    if (session) {
      console.log('Session data received from WebSocket:', session);
      setLoading(false);
    }
  }, [session]);

  // Set a timeout to stop loading even if WebSocket is slow
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Loading timeout - stopping loading state');
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

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
    console.log('[Active] WS Message received:', message);

    if (message.type === 'state' && message.session) {
      console.log('[Active] Setting session:', message.session);
      setSession(message.session);

      if (message.distance !== undefined) {
        console.log('[Active] Setting distance:', message.distance);
        setDistance(message.distance);
      } else {
        console.log('[Active] No distance in message');
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

  // Auto-activate beacon for passengers
  useEffect(() => {
    if (role === 'passenger' && session && !loading) {
      // Small delay to ensure everything is loaded
      console.log('Auto-activating beacon for passenger');
      const timer = setTimeout(() => {
        navigate(`/session/${code}/beacon`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [role, session, loading, navigate, code]);

  // Vibrate when close
  useEffect(() => {
    if (distance && distance < 50) {
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
    if (!session) {
      console.error('No session data available');
      return;
    }
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

  if (location.loading || (loading && !session)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-lg animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {location.loading ? 'Getting your location...' : 'Loading session...'}
          </h2>
          <p className="text-gray-600 mb-4">Please wait</p>
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow">
            <span className="font-mono font-semibold">{code}</span>
          </div>
        </div>
      </div>
    );
  }

  const otherRole = role === 'driver' ? 'passenger' : 'driver';
  const otherConnected = session?.[otherRole]?.connected;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-md mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Session Active</h1>
          <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100">
            <span className="text-gray-600">Code:</span>
            <span className="font-mono font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{code}</span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-gray-700 font-medium">Connection</span>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isConnected ? 'Active' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${otherConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className="text-gray-700 font-medium">
                {role === 'driver' ? 'Passenger' : 'Driver'}
              </span>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${otherConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {otherConnected ? 'Connected' : 'Waiting...'}
            </span>
          </div>
        </div>

        {/* Distance Display */}
        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-gray-600 mb-3 font-medium">Distance</p>
          {distance !== null ? (
            <>
              <p className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {formatDistance(distance)}
              </p>
              {distance < 50 && (
                <div className="mt-4 bg-green-100 rounded-full px-4 py-2 inline-flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700 font-semibold">You're very close!</span>
                </div>
              )}
              {distance >= 50 && distance < 100 && (
                <p className="mt-4 text-indigo-600 font-medium">Getting closer...</p>
              )}
            </>
          ) : (
            <>
              <p className="text-4xl font-bold text-gray-400 mb-2">--</p>
              <p className="text-sm text-gray-500">
                {otherConnected ? 'Calculating distance...' : 'Waiting for other party...'}
              </p>
            </>
          )}
        </div>

        {/* Visual Info */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-700 font-medium">Your beacon color</p>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>
          {session ? (
            <div
              className="h-20 rounded-2xl shadow-lg border-4 border-white"
              style={{ backgroundColor: session.visual.color }}
            />
          ) : (
            <div className="h-20 rounded-2xl shadow-lg border-4 border-white bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Loading...</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-4">
          {role === 'driver' && (
            <button
              onClick={handleShare}
              className="w-full min-h-[70px] bg-white text-indigo-600 font-semibold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl border-2 border-indigo-200 hover:border-indigo-300 transition-all duration-300 flex items-center justify-center space-x-3 text-xl"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share Link</span>
            </button>
          )}

          <button
            onClick={handleBeacon}
            disabled={!session}
            className="w-full min-h-[70px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed text-xl"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Activate Beacon</span>
          </button>

          <button
            onClick={handleMet}
            className="w-full min-h-[70px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-3 text-xl"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>We Met!</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full min-h-[70px] bg-white text-gray-700 font-semibold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 text-xl"
          >
            Cancel Session
          </button>
        </div>
      </div>
    </div>
  );
}
