import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useSession } from '../contexts/SessionContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export function Passenger() {
  const navigate = useNavigate();
  const { setRole } = useSession();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinSession = async () => {
    const sessionCode = code.trim().toUpperCase();

    if (!sessionCode || sessionCode.length !== 6) {
      setError('Please enter a valid 6-character code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionInfo = await api.getSession(sessionCode);

      if (!sessionInfo.exists) {
        setError('Session not found. Please check the code.');
        setLoading(false);
        return;
      }

      await api.joinSession(sessionCode);
      setRole('passenger');

      // Navigate to active session page
      navigate(`/session/${sessionCode}/passenger`);
    } catch (err) {
      setError('Failed to join session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Pickup Session
          </h1>
          <p className="text-gray-600">
            Enter the code shared by your driver
          </p>
        </div>

        {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

        <div className="space-y-4">
          <Input
            label="Session Code"
            placeholder="ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={loading}
            maxLength={6}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
            className="text-center text-2xl tracking-wider font-mono"
          />

          <Button
            fullWidth
            onClick={handleJoinSession}
            disabled={loading || code.length !== 6}
            className="py-4"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Join Session'}
          </Button>

          <Button
            fullWidth
            variant="secondary"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
