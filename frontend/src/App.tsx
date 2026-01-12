import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { isAuthenticated } from './utils/auth';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Driver } from './pages/Driver';
import { Passenger } from './pages/Passenger';
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
          {/* Public route - Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes - require authentication */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/driver" element={<ProtectedRoute><Driver /></ProtectedRoute>} />
          <Route path="/passenger" element={<ProtectedRoute><Passenger /></ProtectedRoute>} />
          <Route path="/session/:code/:role" element={<ProtectedRoute><Active /></ProtectedRoute>} />
          <Route path="/session/:code/beacon" element={<ProtectedRoute><Beacon /></ProtectedRoute>} />
          <Route path="/:code" element={<ProtectedRoute><JoinWithCode /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
