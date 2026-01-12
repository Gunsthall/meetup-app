import { getApiKey } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CreateSessionResponse {
  code: string;
  shareUrl: string;
  visual: {
    color: string;
    pattern: number[];
  };
}

export interface GetSessionResponse {
  exists: boolean;
  driverName?: string;
  visual?: {
    color: string;
    pattern: number[];
  };
  status?: string;
  error?: string;
}

export interface JoinSessionResponse {
  success: boolean;
  session?: any;
  error?: string;
}

/**
 * Get authentication headers with API key
 */
function getAuthHeaders(): Record<string, string> {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
}

/**
 * API client for MeetUp backend
 */
export const api = {
  /**
   * Create a new session
   */
  async createSession(driverName: string): Promise<CreateSessionResponse> {
    const response = await fetch(`${API_URL}/v1/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ driverName }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid API key');
      }
      throw new Error('Failed to create session');
    }

    return response.json();
  },

  /**
   * Get session information
   */
  async getSession(code: string): Promise<GetSessionResponse> {
    const response = await fetch(`${API_URL}/v1/sessions/${code}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok && response.status !== 404) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid API key');
      }
      throw new Error('Failed to get session');
    }

    return response.json();
  },

  /**
   * Join a session as passenger
   */
  async joinSession(code: string): Promise<JoinSessionResponse> {
    const response = await fetch(`${API_URL}/v1/sessions/${code}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok && response.status !== 404 && response.status !== 410) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid API key');
      }
      throw new Error('Failed to join session');
    }

    return response.json();
  },

  /**
   * End a session
   */
  async endSession(code: string, role: 'driver' | 'passenger'): Promise<void> {
    const response = await fetch(`${API_URL}/v1/sessions/${code}/end`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid API key');
      }
      throw new Error('Failed to end session');
    }
  },
};
