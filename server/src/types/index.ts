export interface Session {
  code: string;
  createdAt: number;
  expiresAt: number;

  driver: {
    name: string;
    latitude: number | null;
    longitude: number | null;
    lastUpdate: number;
    connected: boolean;
  };

  passenger: {
    latitude: number | null;
    longitude: number | null;
    lastUpdate: number;
    connected: boolean;
  };

  visual: {
    color: string;
    pattern: number[];
  };

  status: 'waiting' | 'active' | 'met' | 'expired';
}

export interface LocationUpdate {
  type: 'location';
  sessionCode: string;
  role: 'driver' | 'passenger';
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface SessionState {
  type: 'state';
  session: Session;
  distance: number | null;
}

export interface WSMessage {
  type: 'location' | 'beacon' | 'met';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  active?: boolean;
}

export interface WSResponse {
  type: 'state' | 'connection' | 'ended';
  session?: Session;
  distance?: number | null;
  otherLocation?: {
    latitude: number;
    longitude: number;
  };
  role?: 'driver' | 'passenger';
  connected?: boolean;
  reason?: 'met' | 'expired' | 'cancelled';
}

export type Role = 'driver' | 'passenger';
