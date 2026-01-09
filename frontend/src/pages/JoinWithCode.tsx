import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useSession } from '../contexts/SessionContext';

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

        // Navigate to active session page
        navigate(`/session/${code}/passenger`);
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl mb-6 shadow-lg animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Joining session...</h2>
          <p className="text-gray-600 mb-4">Please wait</p>
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow">
            <span className="font-mono font-semibold">{code}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Oops!</h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
