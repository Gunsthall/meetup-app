import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useSession } from '../contexts/SessionContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export function Driver() {
  const navigate = useNavigate();
  const { setRole } = useSession();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSession = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.createSession(name.trim());
      console.log('Session created:', response);

      setRole('driver');

      // Small delay to ensure backend is ready
      setTimeout(() => {
        navigate(`/session/${response.code}/driver`);
      }, 100);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to create session. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Pickup Session
          </h1>
          <p className="text-gray-600">
            Enter your name to get a shareable code
          </p>
        </div>

        {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

        <div className="space-y-4">
          <Input
            label="Your Name"
            placeholder="e.g., John"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
          />

          <Button
            fullWidth
            onClick={handleCreateSession}
            disabled={loading || !name.trim()}
            className="py-4"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Create Session'}
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
