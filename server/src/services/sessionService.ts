import { redis } from './redisService.js';
import { analyticsService } from './analyticsService.js';
import { generateCode } from '../utils/codeGenerator.js';
import { colorFromCode, patternFromCode } from '../utils/visualGenerator.js';
import type { Session, Role } from '../types/index.js';

const SESSION_TTL = 7200; // 2 hours in seconds

export const sessionService = {
  /**
   * Create a new session with driver info
   */
  async createSession(driverName: string): Promise<Session> {
    const code = generateCode();
    const now = Date.now();

    const session: Session = {
      code,
      createdAt: now,
      expiresAt: now + SESSION_TTL * 1000,
      driver: {
        name: driverName,
        latitude: null,
        longitude: null,
        lastUpdate: now,
        connected: false,
      },
      passenger: {
        latitude: null,
        longitude: null,
        lastUpdate: now,
        connected: false,
      },
      visual: {
        color: colorFromCode(code),
        pattern: patternFromCode(code),
      },
      status: 'waiting',
    };

    await redis.setEx(`session:${code}`, SESSION_TTL, JSON.stringify(session));

    // Log session creation for analytics
    await analyticsService.logSessionCreated(code, driverName);

    return session;
  },

  /**
   * Get session by code
   */
  async getSession(code: string): Promise<Session | null> {
    const data = await redis.get(`session:${code}`);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Update location for driver or passenger
   */
  async updateLocation(
    code: string,
    role: Role,
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    const session = await this.getSession(code);
    if (!session) return;

    session[role].latitude = location.latitude;
    session[role].longitude = location.longitude;
    session[role].lastUpdate = Date.now();

    // Activate session when passenger connects
    if (session.status === 'waiting' && role === 'passenger') {
      session.status = 'active';
      // Log session join for analytics
      await analyticsService.logSessionJoined(code);
    }

    await redis.setEx(`session:${code}`, SESSION_TTL, JSON.stringify(session));
  },

  /**
   * Set connection status for driver or passenger
   */
  async setConnected(
    code: string,
    role: Role,
    connected: boolean
  ): Promise<void> {
    const session = await this.getSession(code);
    if (!session) return;

    session[role].connected = connected;
    await redis.setEx(`session:${code}`, SESSION_TTL, JSON.stringify(session));
  },

  /**
   * Mark session as met (completed)
   */
  async markAsMet(code: string): Promise<void> {
    const session = await this.getSession(code);
    if (!session) return;

    session.status = 'met';

    // Log session completion for analytics
    await analyticsService.logSessionCompleted(code);

    // Keep for 5 more minutes for final confirmations
    await redis.setEx(`session:${code}`, 300, JSON.stringify(session));
  },

  /**
   * Delete session
   */
  async deleteSession(code: string): Promise<void> {
    await redis.del(`session:${code}`);
  },

  /**
   * Check if session exists
   */
  async sessionExists(code: string): Promise<boolean> {
    const exists = await redis.exists(`session:${code}`);
    return exists === 1;
  },
};
