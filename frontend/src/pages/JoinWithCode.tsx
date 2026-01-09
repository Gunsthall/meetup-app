import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useSession } from '../contexts/SessionContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export function JoinWithCode() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { setRole } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const joinSession = async () => {
      if (!code) {
        setError('Invalid session code');
        setLoading(false);
        return;
      }

      try {
        // Check if session exists
        const sessionInfo = await api.getSession(code);

        if (!sessionInfo.exists) {
          setError('Session not found. Please check the code.');
          setLoading(false);
          return;
        }

        // Join the session
        await api.joinSession(code);
        setRole('passenger');

        // Navigate directly to beacon for immediate visual identification
        navigate(`/session/${code}/beacon`);
      } catch (err) {
        console.error('Failed to join session:', err);
        setError('Failed to join session. Please try again.');
        setLoading(false);
      }
    };

    joinSession();
  }, [code, navigate, setRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Joining session...</p>
          <p className="mt-2 text-sm text-gray-500">Code: {code}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <ErrorMessage message={error} />
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
