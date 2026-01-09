import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { Home } from './pages/Home';
import { Driver } from './pages/Driver';
import { Passenger } from './pages/Passenger';
import { Active } from './pages/Active';
import { Beacon } from './pages/Beacon';
import { JoinWithCode } from './pages/JoinWithCode';

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/driver" element={<Driver />} />
          <Route path="/passenger" element={<Passenger />} />
          <Route path="/session/:code/:role" element={<Active />} />
          <Route path="/session/:code/beacon" element={<Beacon />} />
          <Route path="/:code" element={<JoinWithCode />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
