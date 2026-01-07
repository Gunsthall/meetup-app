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

export type Role = 'driver' | 'passenger';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
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
  role?: Role;
  connected?: boolean;
  reason?: 'met' | 'expired' | 'cancelled';
}
