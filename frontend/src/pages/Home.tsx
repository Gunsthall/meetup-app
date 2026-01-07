import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MeetUp</h1>
          <p className="text-gray-600">Airport pickup made easy</p>
        </div>

        <div className="space-y-4">
          <Button
            fullWidth
            onClick={() => navigate('/driver')}
            className="text-lg py-4"
          >
            I'm picking up someone
          </Button>

          <Button
            fullWidth
            variant="secondary"
            onClick={() => navigate('/passenger')}
            className="text-lg py-4"
          >
            I'm being picked up
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Find each other easily using GPS and visual beacons
        </p>
      </div>
    </div>
  );
}
