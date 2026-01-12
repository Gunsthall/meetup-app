import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { isAuthenticated } from './utils/auth';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Driver } from './pages/Driver';
import { Active } from './pages/Active';
import { Beacon } from './pages/Beacon';
import { JoinWithCode } from './pages/JoinWithCode';

/**
 * Protected route wrapper - redirects to login if not authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - No authentication required */}
          <Route path="/login" element={<Login />} />
          <Route path="/:code" element={<JoinWithCode />} />
          <Route path="/session/:code/beacon" element={<Beacon />} />

          {/* Protected routes - Require authentication (driver only) */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/driver" element={<ProtectedRoute><Driver /></ProtectedRoute>} />

          {/* Session routes - Public for passengers, protected for drivers */}
          <Route path="/session/:code/:role" element={<Active />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
