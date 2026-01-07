import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, Role } from '../types';

interface SessionContextType {
  session: Session | null;
  role: Role | null;
  distance: number | null;
  setSession: (session: Session | null) => void;
  setRole: (role: Role | null) => void;
  setDistance: (distance: number | null) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const clearSession = () => {
    setSession(null);
    setRole(null);
    setDistance(null);
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        role,
        distance,
        setSession,
        setRole,
        setDistance,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
