import { redis } from './redisService.js';

/**
 * Simple analytics service for tracking usage
 * Stores events in Redis for easy querying
 */
export const analyticsService = {
  /**
   * Log a session creation event
   */
  async logSessionCreated(code: string, driverName: string): Promise<void> {
    const timestamp = Date.now();
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Store individual event
    const event = {
      type: 'session_created',
      code,
      driverName,
      timestamp,
      date,
    };

    // Store in a sorted set for time-based queries
    await redis.zAdd('analytics:events', {
      score: timestamp,
      value: JSON.stringify(event),
    });

    // Increment daily counter
    await redis.incr(`analytics:daily:${date}:sessions`);

    // Set expiry on daily counter (keep for 90 days)
    await redis.expire(`analytics:daily:${date}:sessions`, 90 * 24 * 60 * 60);

    // Increment total counter
    await redis.incr('analytics:total:sessions');
  },

  /**
   * Log a session join event
   */
  async logSessionJoined(code: string): Promise<void> {
    const timestamp = Date.now();
    const date = new Date().toISOString().split('T')[0];

    const event = {
      type: 'session_joined',
      code,
      timestamp,
      date,
    };

    await redis.zAdd('analytics:events', {
      score: timestamp,
      value: JSON.stringify(event),
    });

    await redis.incr(`analytics:daily:${date}:joins`);
    await redis.expire(`analytics:daily:${date}:joins`, 90 * 24 * 60 * 60);
    await redis.incr('analytics:total:joins');
  },

  /**
   * Log a session completion event
   */
  async logSessionCompleted(code: string): Promise<void> {
    const timestamp = Date.now();
    const date = new Date().toISOString().split('T')[0];

    const event = {
      type: 'session_completed',
      code,
      timestamp,
      date,
    };

    await redis.zAdd('analytics:events', {
      score: timestamp,
      value: JSON.stringify(event),
    });

    await redis.incr(`analytics:daily:${date}:completions`);
    await redis.expire(`analytics:daily:${date}:completions`, 90 * 24 * 60 * 60);
    await redis.incr('analytics:total:completions');
  },

  /**
   * Get usage statistics
   */
  async getStats(): Promise<{
    total: {
      sessions: number;
      joins: number;
      completions: number;
    };
    today: {
      sessions: number;
      joins: number;
      completions: number;
    };
    last7Days: Array<{
      date: string;
      sessions: number;
      joins: number;
      completions: number;
    }>;
  }> {
    const today = new Date().toISOString().split('T')[0];

    // Get total counters
    const totalSessions = await redis.get('analytics:total:sessions');
    const totalJoins = await redis.get('analytics:total:joins');
    const totalCompletions = await redis.get('analytics:total:completions');

    // Get today's stats
    const todaySessions = await redis.get(`analytics:daily:${today}:sessions`);
    const todayJoins = await redis.get(`analytics:daily:${today}:joins`);
    const todayCompletions = await redis.get(`analytics:daily:${today}:completions`);

    // Get last 7 days
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const sessions = await redis.get(`analytics:daily:${dateStr}:sessions`);
      const joins = await redis.get(`analytics:daily:${dateStr}:joins`);
      const completions = await redis.get(`analytics:daily:${dateStr}:completions`);

      last7Days.push({
        date: dateStr,
        sessions: parseInt(sessions || '0'),
        joins: parseInt(joins || '0'),
        completions: parseInt(completions || '0'),
      });
    }

    return {
      total: {
        sessions: parseInt(totalSessions || '0'),
        joins: parseInt(totalJoins || '0'),
        completions: parseInt(totalCompletions || '0'),
      },
      today: {
        sessions: parseInt(todaySessions || '0'),
        joins: parseInt(todayJoins || '0'),
        completions: parseInt(todayCompletions || '0'),
      },
      last7Days,
    };
  },

  /**
   * Get recent events (for detecting viral spread)
   */
  async getRecentEvents(limit: number = 100): Promise<Array<{
    type: string;
    code: string;
    driverName?: string;
    timestamp: number;
    date: string;
  }>> {
    // Get last N events from sorted set
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const events = await redis.zRangeByScore(
      'analytics:events',
      oneDayAgo,
      now
    );

    return events
      .map(e => JSON.parse(e))
      .slice(-limit)
      .reverse();
  },

  /**
   * Detect suspicious activity (potential unauthorized sharing)
   */
  async detectAnomalies(): Promise<{
    suspiciousActivity: boolean;
    reason?: string;
    details?: any;
  }> {
    const stats = await this.getStats();
    const recentEvents = await this.getRecentEvents(50);

    // Check for sudden spike (more than 5x average)
    const last7DaysAvg = stats.last7Days.slice(1, 7).reduce((sum, day) => sum + day.sessions, 0) / 6;
    const todaySessions = stats.today.sessions;

    if (todaySessions > last7DaysAvg * 5 && last7DaysAvg > 0) {
      return {
        suspiciousActivity: true,
        reason: 'Unusual spike in session creation',
        details: {
          todaySessions,
          averageLast7Days: Math.round(last7DaysAvg),
          increaseMultiple: Math.round(todaySessions / last7DaysAvg),
        },
      };
    }

    // Check for many sessions in short time (more than 10 in last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const lastHourSessions = recentEvents.filter(
      e => e.type === 'session_created' && e.timestamp > oneHourAgo
    ).length;

    if (lastHourSessions > 10) {
      return {
        suspiciousActivity: true,
        reason: 'High session creation rate',
        details: {
          sessionsLastHour: lastHourSessions,
          threshold: 10,
        },
      };
    }

    return { suspiciousActivity: false };
  },
};
