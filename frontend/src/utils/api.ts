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
 * Get authentication headers with API key (optional for passengers)
 */
function getAuthHeaders(requireAuth: boolean = false): Record<string, string> {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Include API key if available (required for drivers, optional for passengers)
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (requireAuth) {
    throw new Error('Authentication required but no API key found');
  }

  return headers;
}

/**
 * API client for MeetUp backend
 */
export const api = {
  /**
   * Create a new session (REQUIRES AUTH - driver only)
   */
  async createSession(driverName: string): Promise<CreateSessionResponse> {
    const response = await fetch(`${API_URL}/v1/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(true), // Require auth
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
   * Get session information (NO AUTH REQUIRED - public for passengers)
   */
  async getSession(code: string): Promise<GetSessionResponse> {
    const response = await fetch(`${API_URL}/v1/sessions/${code}`, {
      headers: getAuthHeaders(false), // No auth required
    });

    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to get session');
    }

    return response.json();
  },

  /**
   * Join a session as passenger (NO AUTH REQUIRED - public for passengers)
   */
  async joinSession(code: string): Promise<JoinSessionResponse> {
    const response = await fetch(`${API_URL}/v1/sessions/${code}/join`, {
      method: 'POST',
      headers: getAuthHeaders(false), // No auth required
    });

    if (!response.ok && response.status !== 404 && response.status !== 410) {
      throw new Error('Failed to join session');
    }

    return response.json();
  },

  /**
   * End a session (NO AUTH REQUIRED - can be called by passengers)
   */
  async endSession(code: string, role: 'driver' | 'passenger'): Promise<void> {
    const response = await fetch(`${API_URL}/v1/sessions/${code}/end`, {
      method: 'POST',
      headers: getAuthHeaders(false), // No auth required
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error('Failed to end session');
    }
  },
};
